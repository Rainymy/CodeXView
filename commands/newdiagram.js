const { readPrompt } = require("../src/utils/fileHandler");
const fs = require('node:fs');
const path = require('node:path');
const vscode = require('vscode');
const { getActiveDocumentFile, selectFileDialog } = require('../src/fallbacks/activeDocument');
const { analyzeCode, syntaxTreeToJson } = require('../src/utils/codeParser');

const { Notify, parseSetup } = require("./vsUtil");

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
  AIConnection.prompt = readPrompt();
  const diagram = await AIConnection.getChatResponse(parsedJson);

  if (!diagram) {
    Notify.info('CodeXView! Failed to generate Diagram.');
    return;
  }
  console.log("XML Code:", diagram);
  //const workspaceFolders = vscode.workspace.workspaceFolders;
  // if (workspaceFolders && workspaceFolders.length > 0) {
  //   const folderPath = workspaceFolders[0].uri.fsPath;
  //   const filePath = path.join(folderPath, 'diagram.xml');
  //   const cleaned = diagram.replace(/^```xml\s*\n/, '').replace(/\n```$/, '');
  //   fs.writeFile(filePath, cleaned, (err) => {
  //     if (err) {
  //       vscode.window.showErrorMessage(`Failed to write XML file: ${err.message}`);
  //     } else {
  //       vscode.window.showInformationMessage('diagram.xml created in workspace folder!');
  //     }
  //   });
  // } else {
  //   vscode.window.showErrorMessage('No workspace folder found.');
  // }
}

module.exports = newDiagram;