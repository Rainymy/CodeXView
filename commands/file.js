const path = require("node:path");

const { readPrompt } = require('../src/utils/fileHandler');
const { analyzeCode } = require('../src/utils/codeParser');

const { generateCCDiagram } = require('../src/components/diagramGenerator');

const { getActiveDocumentFile, selectFileDialog } = require('../src/fallbacks/activeDocument');

const { syntaxTreeToJson } = require("../parsers/utils");
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

  // Notify.info('CodeXView! Processing......');

  AIConnection.setPrompt(readPrompt());
  const diagram = await AIConnection.getChatResponse(parsedJson);

  if (!diagram) {
    Notify.info('CodeXView! Failed to generate Diagram.');
    return;
  }

  // add diagram to project
  console.log("DiagramCode:", diagram);
  const added = await generateCCDiagram(diagram);
  if (!added) {
    Notify.error("CodeXView! Error adding diagram to project...");
    return;
  }
  Notify.info("CodeXView! Finnished, Diagram has been added to your project...");
}

module.exports = fileAnalysis;