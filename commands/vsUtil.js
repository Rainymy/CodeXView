const codexview = require("../src/components/setup");
const ProjectConfig = require("../src/components/ProjectConfig");

const vscode = require('vscode');
// const vscode = {
//   window: {
//     showInformationMessage: console.log,
//     showWarningMessage: console.log,
//     showErrorMessage: console.log
//   }
// }

const Notify = {
  info: vscode.window.showInformationMessage,
  warning: vscode.window.showWarningMessage,
  error: vscode.window.showErrorMessage
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
* @param {String} identifier
* @param {String} title
* @returns
*/
function createWebviewPanel(identifier, title) {
  return vscode.window.createWebviewPanel(
    identifier, title, vscode.ViewColumn.Active,
    {
      enableScripts: true,
      // retainContextWhenHidden: true
    }
  );
}

module.exports = {
  Notify: Notify,
  parseSetup: parseSetup,
  createWebviewPanel: createWebviewPanel
}