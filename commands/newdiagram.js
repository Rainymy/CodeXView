const path = require('node:path');

const { readPrompt, customWriteStream } = require("../src/utils/fileHandler");
const { analyzeCode } = require('../src/utils/codeParser');

const { getActiveDocumentFile, selectFileDialog } = require('../src/fallbacks/activeDocument');

const { Notify, parseSetup } = require("./vsUtil");
const { syntaxTreeToJson } = require("../parsers/utils");

const ProjectConfig = require('../src/components/ProjectConfig');
const AIConnection = require("../src/components/AIConnection");

async function newDiagram() {
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
  AIConnection.setPrompt(readPrompt());
  const diagram = await AIConnection.getChatResponse(parsedJson);

  if (!diagram) {
    Notify.info('CodeXView! Failed to generate Diagram.');
    return;
  }
  console.log("XML Code:", diagram);

  // const filePath = path.join(ProjectConfig.getOutputFolder(), "diagram.xml");
  // const cleaned = diagram.replace(/^```xml\s*\n/, '').replace(/\n```$/, '');

  // const err = await customWriteStream(filePath, cleaned);
  // if (err) {
  //   Notify.error(`Failed to write XML file: ${err.message}`);
  // } else {
  //   Notify.info('diagram.xml created in workspace folder!');
  // }
}

module.exports = newDiagram;