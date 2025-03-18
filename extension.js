const path = require("path");
const vscode = require('vscode');

// const { parseCodeBase } = require("./src/components/codebaseParser");
const { parseCodeBase } = require("./src/utils/codebaseParser");
const { generateCCDiagram } = require('./src/components/diagramGenerator');

const { fetchFileToAnalyze, getWorkspaceFolder } = require('./src/utils/activeDocument');
const { loadIgnoreRules } = require("./src/utils/ignoreRules");
const { parseCode, syntaxTreeToJson } = require('./src/utils/codeParser');

const { load_parsers } = require("./parsers/loader.js");

const AIConnection = require("./src/components/AIConnection");
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
async function activate(context) {
  // The command has been defined in the package.json file
  // Now provide the implementation of the command with  registerCommand
  // The commandId parameter must match the command field in package.json
  await startUp();

  const disposable = vscode.commands.registerCommand('codexview.run', async () => {
    const selectedFile = await fetchFileToAnalyze();

    if (selectedFile.length === 0) {
      Notify.error('No file selected.');
    }

    if (selectedFile.length > 0) {
      Notify.info('CodeXView! Found File...');

      if (!parseSetup(path.dirname(selectedFile))) {
        return Notify.error("Problem with permission!");
      }

      const parsedCode = await parseCode(selectedFile);
      const parsedJson = syntaxTreeToJson(parsedCode);

      Notify.info('CodeXView! Processing......');

      //ta ut information från parsade koden, som fil count och namn, functions count+namn
      // och samma för variabler till resultats checkning

      const diagram = await AIConnection.getChatResponse(parsedJson);
      console.log("DiagramCode:", diagram);

      if (!diagram) {
        Notify.info('CodeXView! Failed to generate Diagram.');
        return;
      }

      // add diagram to project
      const added = await generateCCDiagram(diagram);
      if (added) {
        Notify.info('CodeXView! Finnished, Diagram has been added to your project...');
      } else {
        Notify.error('CodeXView! Error adding diagram to project...');
      }
    }
  });

  const disposable2 = vscode.commands.registerCommand("codexview.runmultiple", async () => {
    try {
      const folder = getWorkspaceFolder();
      if (!folder) {
        Notify.error("❌ No workspace folder found.");
        return;
      }

      if (!parseSetup(folder)) {
        return Notify.error("Problem with permission!");
      }

      Notify.info("🔍 CodeXView! Found Codebase...");

      // const folderName = path.basename(folder);
      const parsedCode = await parseCodeBase(folder);

      if (!parsedCode) {
        Notify.error("❌ Code parsing failed.");
        return;
      }

      console.log("Parsed Code:", parsedCode);
      // let diagramCode = "";

      // await addDiagramToProject(diagramCode, folder, folderName);

    } catch (error) {
      Notify.error(`❌ Error: ${error.message}`);
      console.error(error);
    }
  });

  context.subscriptions.push(disposable, disposable2);
}

/**
* this function for everytime extension runs.
* @param {String} rootPathFs
* @returns {boolean} is OK to continue?
*/
function parseSetup(rootPathFs) {
  // === DONT FORGET TO SET ROOT PATH!!! ===
  // save folder will be somewhere at the narnia.
  ProjectConfig.setRootPath(rootPathFs);
  // ensure_structure uses root path to verify output folder.
  const structure = codexview.ensure_structure();

  if (structure.fatal) {
    Notify.error(structure.fatal);
    return false;
  }

  if (structure.info.length) {
    Notify.warning(structure.info.join("\n"));
  }

  loadIgnoreRules();

  return true;
}

/**
* this function runs once.
*/
async function startUp() {
  // access keyvault
  KeyVault.init();

  // read configs from jsonc
  ProjectConfig.load(path.join(__dirname, "./config.jsonc"));

  await load_parsers();
}

// This method is called when your extension is deactivated
function deactivate() { }

module.exports = {
  activate,
  deactivate
}
