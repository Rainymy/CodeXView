const vscode = require('vscode');

const { load_parsers } = require("./parsers/loader.js");
const { measureTime } = require("./parsers/perf_utils.js");

const OpenAIConnection = require("./src/components/OpenAICompletion.js");
// const AIConnection = require("./src/components/AIConnection.js");
const ProjectConfig = require("./src/components/ProjectConfig");
const { KeyVault } = require("./src/components/Keyvault");

const { printFancyMultilineTitle } = require("./src/utils/fancyTitle.js");

const fileAnalysis = require("./commands/file.js");
const codebaseAnalysis = require("./commands/codebase.js");
const { createWebview } = require("./commands/webview.js");
const diagramTesting = require("./commands/testFile.js");

/**
 * @param {vscode.ExtensionContext} context
 */
async function activate(context) {
  const infos = await startUp();
  printFancyMultilineTitle(["Extension READY", "", ...infos]);

  const register = vscode.commands.registerCommand;

  const disposable = register('codexview.file', fileAnalysis);
  const disposable2 = register("codexview.codebase", codebaseAnalysis);
  const disposable3 = register("codexview.webview", createWebview);
  const disposable4 = register("codexview.diagramtest", diagramTesting);

  const allDisposables = [
    disposable, disposable2, disposable3, disposable4
  ]

  context.subscriptions.push(...allDisposables);
}

/**
* this function runs once.
*/
async function startUp() {
  const timeInfos = [];
  KeyVault.init();

  const [timeAI] = await measureTime(OpenAIConnection.init());
  //const [timeAI] = await measureTime(AIConnection.init());
  timeInfos.push(`[ AI Connection ]: ${timeAI}ms`);

  ProjectConfig.load();

  const [timeParsers] = await measureTime(load_parsers());
  timeInfos.push(`[ Load parsers ]: ${timeParsers}ms`);

  return timeInfos;
}

// This method is called when your extension is deactivated
function deactivate() { }

module.exports = {
  activate,
  deactivate
}
