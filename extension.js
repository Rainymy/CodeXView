const path = require("path");
const vscode = require('vscode');

const { parseCodeBase } = require("./src/components/codebaseParser");
const { fetchFileToAnalyze, getWorkspaceFolder } = require('./src/utils/activeDocument');

const { parseCode, syntaxTreeToJson } = require('./src/utils/codeParser');
const { generateCCDDiagram } = require('./src/components/diagramGenerator');

const AIConnection = require("./src/components/aiConnection");
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

      const parsedCode = await parseCode(selectedFile);
      const parsedJson = syntaxTreeToJson(parsedCode);

      Notify.info('CodeXView! Processing......');

      //ta ut information från parsade koden, som fil count och namn, functions count+namn
      // och samma för variabler till resultats checkning

      // const AICon = await (new AIConnection()).init();

      await AIConnection.getChatResponse(parsedJson);
      console.log("DiagramCode:", AIConnection.diagramCode);
      // add diagram to project
      const added = await generateCCDDiagram(AIConnection.diagramCode);
      if (added) {
        Notify.info('CodeXView! Finnished, Diagram has been added to your project...');
      } else {
        Notify.error('CodeXView! Error adding diagram to project...');
      }
    } else {
      Notify.error('No file selected.');
    }
  });

  const disposable2 = vscode.commands.registerCommand("codexview.runmultiple", async () => {
    try {
      const folder = getWorkspaceFolder();
      if (!folder) {
        vscode.window.showErrorMessage("❌ No workspace folder found.");
        return;
      }

      vscode.window.showInformationMessage("🔍 CodeXView! Found Codebase...");
      vscode.window.showInformationMessage("🚀 CodeXView! Started...");

      const folderName = path.basename(folder);
      const parsedCode = await parseCodeBase(folder);

      if (!parsedCode) {
        vscode.window.showErrorMessage("❌ Code parsing failed.");
        return;
      }

      console.log("Parsed Code:", parsedCode);
      let diagramCode = "";


      // await addDiagramToProject(diagramCode, folder, folderName);

    } catch (error) {
      vscode.window.showErrorMessage(`❌ Error: ${error.message}`);
      console.error(error);
    }
  });

  context.subscriptions.push(disposable, disposable2);
}


// This method is called when your extension is deactivated
function deactivate() { }

module.exports = {
  activate,
  deactivate
}


