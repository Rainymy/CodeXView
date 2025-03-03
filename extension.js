const path = require("node:path");
const vscode = require('vscode');

const { fetchFileToAnalyze } = require('./src/utils/activeDocument');

const { parseCode, syntaxTreeToJson } = require('./src/utils/codeParser');
const { generateCCDDiagram } = require('./src/components/diagramGenerator');

const AIConnection = require('./src/components/AIConnection');
const ProjectConfig = require("./src/components/ProjectConfig");
const { KeyVault } = require("./src/components/Keyvault");
const codexview = require("./src/components/setup");

const Notify = {
  info: vscode.window.showInformationMessage,
  warning: vscode.window.showWarningMessage,
  error: vscode.window.showErrorMessage
};

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  // The command has been defined in the package.json file
  // Now provide the implementation of the command with  registerCommand
  // The commandId parameter must match the command field in package.json
  const disposable = vscode.commands.registerCommand('codexview.run', async () => {
    // empty for now
    codexview.setup();
    // access keyvault
    KeyVault.init();

    // read configs from jsonc
    ProjectConfig.load(path.join(__dirname, "./config.jsonc"));

    const selectedFile = await fetchFileToAnalyze();

    if (selectedFile.length > 0) {
      Notify.info('CodeXView! Found File...');
      // === DONT FORGET TO SET ROOT PATH!!! ===
      // save folder will be somewhere at the narnia.
      ProjectConfig.setRootPath(path.dirname(selectedFile));
      // ensure_structure uses root path to verify output folder.
      const structure = codexview.ensure_structure();

      if (structure.fatal) { return Notify.error(structure.fatal); }
      if (structure.info.length) { Notify.warning(structure.info.join("\n")); }

      Notify.info('CodeXView! Started...');

      // const parsedCode = await parseCode(selectedFile);
      // const parsedJson = syntaxTreeToJson(parsedCode);

      Notify.info('CodeXView! Processing......');
      // console.log(parsedCode.printDotGraph());
      // console.log("Parsed JSON:", parsedJson);

      //ta ut information från parsade koden, som fil count och namn, functions count+namn
      // och samma för variabler till resultats checkning

      const AICon = await (new AIConnection()).init();

      // skicka parsedCode till AI
      // Does nothing for now
      // const response = await AICon.getChatResponse(parsedCode);
      // console.log("DiagramCode:", AICon.diagramCode);
      //const diagramCode = AICon.diagramCode;

      // add diagram to project
      const added = await generateCCDDiagram();
      if (added) {
        Notify.info('CodeXView! Finnished, Diagram has been added to your project...');
      } else {
        Notify.error('CodeXView! Error adding diagram to project...');
      }


    } else {
      Notify.error('No file selected.');
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


