const fs = require("node:fs");
const { detectLanguage, DETECTION_ERROR } = require("linguist-sense");

const {
  getParser,
  getLanguageParser,
  doesLanguageParserExist
} = require("../../parsers/loader.js");

/**
* @param {String} filePath
* @returns
*/
async function analyzeCode(filePath) {
  const lang = await detectLanguage(filePath);

  if (lang instanceof Error) {
    if (lang.message === DETECTION_ERROR.UNKNOWN_LANGUAGE) {
      console.log("❌ Found No Programming Languages!");
    }
    else {
      console.log(lang);
    }
    return;
  }

  if (!doesLanguageParserExist(lang.name)) {
    console.warn(`⚠️  No parser available for language: ${lang.name}`);
    return;
  }

  const parser = getParser();
  parser.setLanguage(getLanguageParser(lang.name));

  return parser.parse(fs.readFileSync(filePath, "utf8"));
}

module.exports = {
  analyzeCode: analyzeCode
}