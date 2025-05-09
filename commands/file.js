const path = require("node:path");

const { customWriteStream, writeParser } = require('../src/utils/fileHandler');
const { analyzeCode } = require('../src/utils/codeParser');

const { validateDiagram, getNextFileName } = require('../src/components/diagramGenerator');
const PlantUML = require("../src/components/PlantUML");

const { getActiveDocumentFile, selectFileDialog } = require('../src/fallbacks/activeDocument');

const { syntaxTreeToJson, extractNodesInfo, simplifyAST, extractInstantiatedClasses } = require("../parsers/utils");
const { Notify, parseSetup } = require("./vsUtil");

async function fileAnalysis() {
  const selectedFile = getActiveDocumentFile() ?? await selectFileDialog();

  if (!selectedFile) {
    Notify.error('No active document found / No file selected.');
    return;
  }

  Notify.info('CodeXView! Found File...');

  if (!parseSetup(path.dirname(selectedFile))) {
    Notify.error("⚠️ Problem with permission!");
    return;
  }

  Notify.info('CodeXView! Processing......');

  const parsedJson = syntaxTreeToJson(analyzeCode(selectedFile));
 
  const slim = simplifyAST([parsedJson]);

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

  console.log(JSON.stringify(slim, null, 2));
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
    console.log(`[ ${fileAnalysis.name} ] ${error}`);
    Notify.error("CodeXView! Error adding diagram to project...");
    return;
  }
  
  Notify.info("CodeXView! Finished, Diagram has been added to your project...");
}

module.exports = fileAnalysis;
