const loadAllParsers = require("../../parsers/loader.js");
const parsers = loadAllParsers();

/**
* @param {String} filePath
* @returns
*/
function detectLanguageByPath(filePath) {
  if (filePath.endsWith(".js")) return parsers.get("javascript");
}

module.exports = {
  detectLanguageByPath: detectLanguageByPath,
  getLanguageParser: () => { }
}