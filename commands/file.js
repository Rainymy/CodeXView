const path = require("node:path");

const { generateCCDiagram } = require('../src/components/diagramGenerator');

const { getActiveDocumentFile, selectFileDialog } = require('../src/fallbacks/activeDocument');
const { analyzeCode, syntaxTreeToJson } = require('../src/utils/codeParser');

const { Notify, parseSetup } = require("./vsUtil");

const AIConnection = require("../src/components/AIConnection");

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

  Notify.info('CodeXView! Processing......');

  console.log("parsedJson: ", parsedJson);

  //Get information from the parsed code, such as file count and names,
  //function count and names, and the same for variables, to check results.

  const diagram = await AIConnection.getChatResponse(parsedJson);

  if (!diagram) {
    Notify.info('CodeXView! Failed to generate Diagram.');
    return;
  }

  // add diagram to project
  console.log("DiagramCode:", diagram);
  const added = await generateCCDiagram(diagram);
  if (added) {
    Notify.info('CodeXView! Finnished, Diagram has been added to your project...');
  } else {
    Notify.error('CodeXView! Error adding diagram to project...');
  }
}

module.exports = fileAnalysis;