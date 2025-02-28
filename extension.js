/* eslint-disable no-unused-vars */
// module import
const path = require("path");
const vscode = require('vscode');

// function imports
const { parseCode, syntaxTreeToJson } = require('./src/components/codeParser');
const { fetchFileToAnalyze } = require('./src/utils/activeDocument');
const { generateCCDDiagram } = require('./src/components/diagramGenerator');
const AIConnection = require('./src/components/aiConnection');

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

  let parsedCode;
  // The command has been defined in the package.json file
  // Now provide the implementation of the command with  registerCommand
  // The commandId parameter must match the command field in package.json
  const disposable = vscode.commands.registerCommand('codexview.run', async function () {

    let selectedFile = await fetchFileToAnalyze();
    vscode.window.showInformationMessage('CodeXView! Found File...');

    if (selectedFile.length > 0) {
      vscode.window.showInformationMessage('CodeXView! Started...');

      parsedCode = await parseCode(selectedFile);
      const parsedJson = syntaxTreeToJson(parsedCode);

      console.log(parsedCode.printDotGraph());
      console.log("Parsed JSON:", parsedJson);
      //ta ut information från parsade koden, som fil count och namn, functions count+namn
      // och samma för variabler till resultats checkning

      // skicka parsedCode till AI
      const AICon = await AIConnection;

      // await AICon.getChatResponse(parsedCode);
      // console.log("DiagramCode:", AICon.diagramCode);
      //const diagramCode = AICon.diagramCode;
      let diagramCode;

      // add diagram to project
      const folderPath = path.dirname(selectedFile);
      const folderName = path.basename(folderPath);
      // var added = await generateCCDDiagram(diagramCode, folderPath,folderName);
      // if(added){
      // 	vscode.window.showInformationMessage('CodeXView! Finnished, Diagram has been added to your project...');
      // } else{
      // 	vscode.window.showErrorMessage('CodeXView! Error adding diagram to project...');
      // }


    } else {
      vscode.window.showErrorMessage('No file selected.');
    }

  });


  context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
function deactivate() { }

module.exports = {
  activate,
  deactivate
}


