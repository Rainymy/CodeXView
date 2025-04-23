const fs = require("node:fs");
const { detectLanguageByPath } = require("./detectLanguage");

const {
  getParser,
  getLanguageParser,
  doesLanguageParserExist
} = require("../../parsers/loader.js");

/**
* @param {String} filePath
* @returns
*/
function analyzeCode(filePath) {
  const { language, error, path } = detectLanguageByPath(filePath);

  if (error) {
    console.log("❌ Found No Programming Languages!");
    return;
  }

  if (!doesLanguageParserExist(language)) {
    console.warn(`⚠️  No parser available for language: ${language}`);
    return;
  }

  const parser = getParser();
  parser.setLanguage(getLanguageParser(language));

  return parser.parse(fs.readFileSync(path, "utf8"));
}

module.exports = {
  analyzeCode: analyzeCode
}