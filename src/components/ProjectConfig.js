const path = require("path");

const { readJSONFileSync } = require("../utils/fileHandler");

function ProjectConfig() {
  let config = null;
  let saveFolder = null;
  let createFolder = null;
  let createFile = null;
  let rootPath = "";

  this.canCreateFolder = () => saveFolder && createFolder;
  this.canCreateFile = () => saveFolder && createFile;
  this.getOutputFolder = () => path.join(rootPath, saveFolder);
  this.getOutputParentFolder = () => path.basename(rootPath);

  /**
  * @param {String} configPathFs
  * @throws {Error} Throws error if any important proparty is undefined.
  */
  this.load = (configPathFs) => {
    config = readJSONFileSync(configPathFs);
    this.validate(config);

    saveFolder = config?.saveFolder;
    createFolder = config?.canCreateFolder ?? false;
    createFile = config?.canCreateFile ?? false;
  }

  /**
  * @param {String} rootPathFs
  */
  this.setRootPath = (rootPathFs) => {
    rootPath = rootPathFs;
  }

  /**
  * @param {object} inputConfig
  * @throws {Error} Throws error if any important proparty is undefined.
  */
  this.validate = (inputConfig) => {
    if (!inputConfig.saveFolder) throw Error("Invalid save folder.");
    if (!inputConfig.canCreateFolder || !inputConfig.canCreateFile) {
      throw Error("Invalid permission in config.");
    }
  }
}

module.exports = new ProjectConfig();