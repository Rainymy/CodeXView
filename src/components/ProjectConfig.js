const path = require("node:path");

const { ConfigKeys } = require("../../configKeys");
const { configSetting } = require("../fallbacks/configuration");

function ProjectConfig() {
  /** @type {String}  */
  let saveFolder = null;
  /** @type {Boolean} */
  let createFolder = null;
  /** @type {Boolean} */
  let createFile = null;
  /** @type {Boolean} */
  let ignoreRulesFromWorkspace = null;
  /** @type {import("vscode").WorkspaceConfiguration} */
  let config = null;
  let rootPath = "";

  this.canCreateFolder = () => saveFolder && createFolder;
  this.canCreateFile = () => saveFolder && createFile;
  this.readRootIgnoreRules = () => ignoreRulesFromWorkspace;
  this.getOutputFolder = () => path.join(rootPath, saveFolder);
  this.getRootFolder = () => {
    if (rootPath === "") {
      throw Error("Initialize the root folder first!");
    }
    return rootPath;
  }

  /** @param {String} rootPathFs */
  this.setRootPath = (rootPathFs) => { rootPath = rootPathFs; }

  this.load = () => {
    config = configSetting(ConfigKeys.Name);

    saveFolder = config.get(ConfigKeys.SaveFolder);
    createFolder = config.get(ConfigKeys.CanCreateFolder);
    createFile = config.get(ConfigKeys.CanCreateFile);
    ignoreRulesFromWorkspace = config.get(ConfigKeys.LoadIgnoreRulesFromWorkspace);
  }
}

module.exports = new ProjectConfig();