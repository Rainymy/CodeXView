const path = require("path");

const { readJSONFileSync } = require("../utils/fileHandler");

function ProjectConfig() {
  let config = null;
  let saveFolder = null;
  let createFolder = null;
  let createFile = null;

  this.canCreateFolder = () => saveFolder && createFolder;
  this.canCreateFile = () => saveFolder && createFile;
  this.getOutputFolder = () => saveFolder;

  /**
  * @param {String} configPathFs
  * @throws {Error} Throws error if any important proparty is undefined.
  */
  this.load = (configPathFs) => {
    config = readJSONFileSync(configPathFs);
    this.validate(config);

    saveFolder = config?.saveFolder;
    createFolder = parseBoolFromString(config?.canCreateFolder);
    createFile = parseBoolFromString(config?.canCreateFile);
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

  function parseBoolFromString(str = "") {
    if (str.length === 0) return false;
    if (str.toLowerCase() === "true") return true;

    return false;
  }
}

module.exports = new ProjectConfig();