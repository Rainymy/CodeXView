"use strict";
const vscode = require("vscode");

const { ensureFolderSync } = require("../utils/fileHandler");
const ProjectConfig = require("./ProjectConfig");

/**
* @param {String} configFileFs
* @returns
*/
function codexview_setup(configFileFs) {
  // read configs from jsonc
  ProjectConfig.load(configFileFs);

  // check permission - is file / folder creation allowed?
  // create necessary folders and files.
  if (ProjectConfig.canCreateFolder()) {
    const isFolderOK = ensureFolderSync(ProjectConfig.getOutputFolder());
    if (!isFolderOK) { throw Error("Folder is not okey."); }
  }
  else { vscode.window.showInformationMessage('Create Folder permission is denied!'); }

  if (ProjectConfig.canCreateFile()) { return; }
  else { vscode.window.showInformationMessage('Create File permission is denied!'); }
}

module.exports = codexview_setup;