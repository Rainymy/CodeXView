const path = require("path");
const vscode = require('vscode');

const { load_parsers } = require("./parsers/loader.js");

const AIConnection = require("./src/components/AIConnection");
const ProjectConfig = require("./src/components/ProjectConfig");
const { KeyVault, SECRET_ENUM } = require("./src/components/Keyvault");

const fileAnalysis = require("./commands/file.js");
const codebaseAnalysis = require("./commands/codebase.js");

/**
 * @param {vscode.ExtensionContext} context
 */
async function activate(context) {
  await startUp();

  const register = vscode.commands.registerCommand;

  const disposable = register('codexview.file', fileAnalysis);
  const disposable2 = register("codexview.codebase", codebaseAnalysis);

  context.subscriptions.push(disposable, disposable2);
}

/**
* this function runs once.
*/
async function startUp() {
  // access keyvault
  KeyVault.init();
  AIConnection.apiKey = await KeyVault.getSecret(SECRET_ENUM.KEY);
  AIConnection.apiUrl = await KeyVault.getSecret(SECRET_ENUM.URL);
  AIConnection.password = await KeyVault.getSecret(SECRET_ENUM.PASSWORD);
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
