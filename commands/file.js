const path = require("node:path");

const { readPrompt, customWriteStream } = require('../src/utils/fileHandler');
const { analyzeCode } = require('../src/utils/codeParser');

const { validateAndGetPlantUML, getNextFileName } = require('../src/components/diagramGenerator');
const AIConnection = require("../src/components/AIConnection");

const { getActiveDocumentFile, selectFileDialog } = require('../src/fallbacks/activeDocument');

const { syntaxTreeToJson, extractNodeInfo } = require("../parsers/utils");
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
  const parsedCode = analyzeCode(selectedFile);
  const parsedJson = syntaxTreeToJson(parsedCode);

  const diagramObj = extractNodeInfo(parsedJson);

  Notify.info('CodeXView! Processing......');

  AIConnection.setPrompt(readPrompt());

  const diagramCode = await validateAndGetPlantUML(diagramObj, parsedJson);
  console.log("DiagramCode:", diagramCode);

  if (diagramCode === null) {
    Notify.info("CodeXView! Failed to generate Diagram.");
    return;
  }

  const fileName = getNextFileName();
  const error = await customWriteStream(fileName, diagramCode);

  if (!error) {
    console.log(`[ ${fileAnalysis.name} ] ${error}`);
    Notify.error("CodeXView! Error adding diagram to project...");
    return;
  }

  Notify.info("CodeXView! Finished, Diagram has been added to your project...");
}

module.exports = fileAnalysis;