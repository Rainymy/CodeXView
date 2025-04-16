const { extractNodesInfo } = require("../parsers/utils");

const {
  getNextFileName,
  validateDiagram
} = require("../src/components/diagramGenerator");
const PlantUML = require("../src/components/PlantUML");
const AIConnection = require("../src/components/AIConnection");

const { readPrompt, customWriteStream } = require("../src/utils/fileHandler");
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

  AIConnection.setPrompt(readPrompt());

  const allSyntaxTreeJSON = parsedCode.map((v) => v.json);
  const diagramObj = extractNodesInfo(allSyntaxTreeJSON);
  console.log("Diagram Object:", diagramObj);

  const validDiagram = await validateDiagram(diagramObj, allSyntaxTreeJSON)

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
