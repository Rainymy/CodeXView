const path = require("node:path");

const { readJSONFileSync } = require("../utils/fileHandler");

function ProjectConfig() {
  let config = null;
  /** @type {String} */
  let saveFolder = null;
  /** @type {Boolean} */
  let createFolder = null;
  /** @type {Boolean} */
  let createFile = null;
  /** @type {Boolean} */
  let readRootIgnoreRules = null;
  let rootPath = "";

  this.canCreateFolder = () => saveFolder && createFolder;
  this.canCreateFile = () => saveFolder && createFile;
  this.readRootIgnoreRules = () => readRootIgnoreRules;
  this.getOutputFolder = () => path.join(rootPath, saveFolder);
  this.getRootFolder = () => {
    if (rootPath === "") {
      throw Error("Initialize the root folder first!");
    }
    return rootPath;
  };

  /** @param {String} rootPathFs */
  this.setRootPath = (rootPathFs) => { rootPath = rootPathFs; }

  /**
  * @param {String} configPathFs
  * @throws {Error} Throws error if any important proparty is undefined.
  */
  this.load = (configPathFs) => {
    config = readJSONFileSync(configPathFs);
    const error = this.validate(config);

    if (error) {
      throw Error(error);
    }

    saveFolder = config?.saveFolder;
    createFolder = config?.canCreateFolder ?? false;
    createFile = config?.canCreateFile ?? false;
    readRootIgnoreRules = config?.LOAD_IGNORE_RULES_FROM_ROOT ?? true;
  }

  /**
  * @param {object} inputConfig
  * @returns {String | undefined} Returns `string` for error.
  */
  this.validate = (inputConfig) => {
    if (!inputConfig) return "Invalid Configuration.";
    if (!inputConfig.saveFolder) return "Invalid save folder.";

    const loadIgnoreRulesFromRoot = isBoolean(inputConfig.LOAD_IGNORE_RULES_FROM_ROOT);
    const canCreateFolder = isBoolean(inputConfig.canCreateFolder);
    const canCreateFile = isBoolean(inputConfig.canCreateFile);

    if (!loadIgnoreRulesFromRoot) {
      return "Invalid LOAD_IGNORE_RULES_FROM_ROOT value in config."
    }

    if (!canCreateFolder || !canCreateFile) {
      return "Invalid permission in config.";
    }
  }

  /**
  * @param {any} type
  * @returns {Boolean}
  */
  function isBoolean(type) { return typeof type === "boolean"; }
}

module.exports = new ProjectConfig();