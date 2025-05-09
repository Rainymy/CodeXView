const { simplifyAST } = require("../parsers/utils");

const {
  getNextFileName,
  validateDiagram
} = require("../src/components/diagramGenerator");
const PlantUML = require("../src/components/PlantUML");

const { customWriteStream } = require("../src/utils/fileHandler");
const { analyzeCodebase } = require("../src/utils/codebaseParser");
const { loadIgnoreRules } = require("../src/utils/ignoreRules");

const { getWorkspaceFolder } = require("../src/fallbacks/activeDocument");

const { Notify, parseSetup } = require("./vsUtil");

async function codebaseAnalysis() {
  const folder = getWorkspaceFolder();
  if (!folder) {
    Notify.error("❌ No workspace folder found.");
    return;
  }

  if (!parseSetup(folder)) {
    Notify.error("⚠️ Problem with permission!");
    return;
  }

  Notify.info("🔍 CodeXView! Found Codebase...");

  loadIgnoreRules(); // Temporary placement.

  const parsedCode = await analyzeCodebase();

  if (!parsedCode && parsedCode.length === 0) {
    Notify.error("❌ Code parsing failed.");
    return;
  }

  console.log("Parsed Code:", parsedCode);

  const allSyntaxTreeJSON = parsedCode.map((v) => v.json);
  
  const slim = simplifyAST(allSyntaxTreeJSON);

  const drop = name => name !== "Program";
  slim.classes      = slim.classes.filter(drop);
  slim.associations = slim.associations.filter(a  => drop(a.owner)   && drop(a.type));
  slim.messages     = slim.messages.filter   (m  => drop(m.caller)  && drop(m.callee));
  slim.creations    = slim.creations.filter  (cr => drop(cr.creator) && drop(cr.created));

  const assocSet = new Set();
  for (const a of slim.associations) {
    assocSet.add(a.owner);
    assocSet.add(a.type);
  }

  const creatSet = new Set();
  for (const c of slim.creations) {
    creatSet.add(c.creator);
    creatSet.add(c.created);
  }

  const keep = name => assocSet.has(name) && creatSet.has(name);

  slim.classes = slim.classes.filter(keep);

  slim.associations = slim.associations.filter(
    a => keep(a.owner) && keep(a.type)
  );

  slim.creations = slim.creations.filter(
    c => keep(c.creator) && keep(c.created)
  );

  slim.messages = slim.messages.filter(
    m => keep(m.caller) && keep(m.callee)
  );
  
  const validDiagram = await validateDiagram(slim);

  if (validDiagram === null) {
    Notify.info("CodeXView! Failed to validate Diagram.");
    return;
  }

  const diagramImage = await PlantUML.requestPlamtUMLImage(validDiagram);

  if (diagramImage === null) {
    Notify.info("CodeXView! Failed to generate Diagram.");
    return;
  }

  const fileName = getNextFileName();
  const error = await customWriteStream(fileName, diagramImage);

  if (error) {
    console.log(`[ ${codebaseAnalysis.name} ] ${error}`);
    Notify.error("CodeXView! Error adding diagram to project...");
    return;
  }

  Notify.info("CodeXView! Finished, Diagram has been added to your project...");
}

module.exports = codebaseAnalysis;
