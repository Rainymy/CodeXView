const path = require("path");
const vscode = require('vscode');

const { analyzeCodebase } = require("./src/utils/codebaseParser");
const { generateCCDiagram } = require('./src/components/diagramGenerator');

const { fetchFileToAnalyze, getWorkspaceFolder } = require('./src/utils/activeDocument');
const { loadIgnoreRules } = require("./src/utils/ignoreRules");
const { analyzeCode, syntaxTreeToJson } = require('./src/utils/codeParser');

const { load_parsers } = require("./parsers/loader.js");

const AIConnection = require("./src/components/AIConnection");
const ProjectConfig = require("./src/components/ProjectConfig");
const { KeyVault, SECRET_ENUM } = require("./src/components/Keyvault");
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

    if (!selectedFile) {
      Notify.error('No active document found / No file selected.');
      return;
    }

    Notify.info('CodeXView! Found File...');

    if (!parseSetup(path.dirname(selectedFile))) {
      return Notify.error("⚠️ Problem with permission!");
    }

    const parsedCode = analyzeCode(selectedFile);
    const parsedJson = syntaxTreeToJson(parsedCode);

    Notify.info('CodeXView! Processing......');

    console.log("parsedJson: ", parsedJson);

    // Get information from the parsed code, such as file count and names,
    // function count and names, and the same for variables, to check results.

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
  });

  const disposable2 = vscode.commands.registerCommand("codexview.runmultiple", async () => {
    const folder = getWorkspaceFolder();
    if (!folder) {
      Notify.error("❌ No workspace folder found.");
      return;
    }

    if (!parseSetup(folder)) {
      return Notify.error("⚠️ Problem with permission!");
    }

    Notify.info("🔍 CodeXView! Found Codebase...");

    try {
      loadIgnoreRules(); // Temporary placement.

      const parsedCode = await analyzeCodebase();

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

  return true;
}

/**
* this function runs once.
*/
async function startUp() {
  // access keyvault
  KeyVault.init();
  AIConnection.apiKey = await KeyVault.getSecret(SECRET_ENUM.KEY);
  AIConnection.apiUrl = await KeyVault.getSecret(SECRET_ENUM.URL);

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
