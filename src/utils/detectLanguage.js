const { getLoadedParsers } = require("../../parsers/loader.js");

/**
* @param {String} filePath
* @returns
*/
function detectLanguageByPath(filePath) {
  const parsers = getLoadedParsers();
  if (parsers === null) throw Error("Load the parsers first!");

  if (filePath.endsWith(".js")) return parsers.get("javascript");
  if (filePath.endsWith(".cs")) return parsers.get("c-sharp");
  if (filePath.endsWith(".py")) return parsers.get("python");
  if (filePath.endsWith(".c")) return parsers.get("c");
  if (filePath.endsWith(".java")) return parsers.get("java");
  if (filePath.endsWith(".cpp")) return parsers.get("cpp");
  if (filePath.endsWith(".rb")) return parsers.get("ruby");
}

module.exports = {
  detectLanguageByPath: detectLanguageByPath
}