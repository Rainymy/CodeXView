const { getLoadedParsers } = require("../../parsers/loader.js");

const path = require("path");

/**
* @param {String} filePath
* @returns
*/
function detectLanguageByPath(filePath) {
  // const parsers = getLoadedParsers();
  // if (parsers === undefined) throw Error("Load the parsers first!");

  const language = getLanguage(filePath);

  if (language === undefined) {
    return { language: null, error: "Unknown language." }
  }

  return { language: language, error: null }

  // if (filePath.endsWith(".js")) return parsers.get("javascript");
  // if (filePath.endsWith(".cs")) return parsers.get("c-sharp");
  // if (filePath.endsWith(".py")) return parsers.get("python");
  // if (filePath.endsWith(".c")) return parsers.get("c");
  // if (filePath.endsWith(".java")) return parsers.get("java");
  // if (filePath.endsWith(".cpp")) return parsers.get("cpp");
  // if (filePath.endsWith(".rb")) return parsers.get("ruby");
}

/**
* @param {String} filePath
* @returns {linguest_language.Language=}
*/
function getLanguage(filePath) {
  const ext = path.extname(path.basename(filePath));

  const similarLanguages = Object.values(linguest_language).filter(lang => {
    return lang.extensions.includes(ext);
  });


  return
}

module.exports = {
  detectLanguageByPath: detectLanguageByPath
}