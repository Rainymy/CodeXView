const vscode = require('vscode');

const { load_parsers } = require("./parsers/loader.js");

const OpenAIConnection = require("./src/components/OpenAICompletion.js");
const ProjectConfig = require("./src/components/ProjectConfig");
const { KeyVault } = require("./src/components/Keyvault");

const fileAnalysis = require("./commands/file.js");
const codebaseAnalysis = require("./commands/codebase.js");
const { createWebview } = require("./commands/webview.js");
const newDiagram = require("./commands/newdiagram.js");

/**
 * @param {vscode.ExtensionContext} context
 */
async function activate(context) {
  await startUp();

  const register = vscode.commands.registerCommand;

  const disposable = register('codexview.file', fileAnalysis);
  const disposable2 = register("codexview.codebase", codebaseAnalysis);
  const disposable3 = register("codexview.webview", createWebview);
  const disposable4 = register("codexview.newdiagramtest", newDiagram);

  const allDisposables = [
    disposable, disposable2, disposable3, disposable4
  ]

  context.subscriptions.push(...allDisposables);
}

/**
* this function runs once.
*/
async function startUp() {
  // access keyvault
  KeyVault.init();
  await OpenAIConnection.init();

  ProjectConfig.load();
  await load_parsers();
}

// This method is called when your extension is deactivated
function deactivate() { }

module.exports = {
  activate,
  deactivate
}
