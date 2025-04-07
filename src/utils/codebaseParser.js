const { readFileSync } = require("./fileHandler")

const {
  filterByProgrammingLanguage,
  filterByLanguage,
  languagesSimpleStat,
  detectLanguagesInFiles
} = require('../utils/detectLanguage');
const { loadAllFoldersWithIgnore } = require("../utils/ignoreRules");

const { getParser, getLanguageParser } = require("../../parsers/loader");

/**
* @typedef {import("./detectLanguage").DetectLanguage} DetectLanguage
*/

/**
* @typedef {object} ParsedFile
* @property  {String} file - File path
* @property  {import("web-tree-sitter").Tree?} tree - Parsed syntax tree
*/

// Use github linguest package to identify/analys projact.
async function analyzeCodebase() {
  const allFiles = loadAllFoldersWithIgnore(false);

  const detectedData = detectLanguagesInFiles(allFiles);
  const sourceFiles = filterByProgrammingLanguage(detectedData.detected);

  if (sourceFiles.length === 0) {
    console.log("❌ Found No Programming Languages!");
    return null
  };

  const langStats = languagesSimpleStat(sourceFiles);
  const detectedLanguages = langStats.languages.join((" "));

  console.log(`- 🔍 Detected languages: [ ${detectedLanguages} ]`);
  console.log(`- 📂 Found ${sourceFiles.length} source files.`);

  /** @type {ParsedFile[]} */
  const syntaxTrees = langStats.languages.reduce((accum, language) => {
    accum.push(...parseFilesForLanguage(sourceFiles, language))
    return accum;
  }, []);

  return syntaxTrees;
}

/**
* @param {DetectLanguage[]} sourceFiles
* @param {String} language
* @returns {ParsedFile[]}
*/
function parseFilesForLanguage(sourceFiles, language) {
  const parser = getParser();
  const filesByLanguage = filterByLanguage(sourceFiles, language);

  // This should never happen because it's checked/handled earlier.
  if (filesByLanguage.length === 0) {
    console.warn("⚠️  Unexpected state: filesByLanguage is empty.");
    return [];
  }

  const fileLanguage = filesByLanguage[0].language;
  const languageParser = getLanguageParser(fileLanguage);
  if (!languageParser) {
    console.warn(`⚠️  No parser available for language: ${fileLanguage}`);
    return [];
  }

  parser.setLanguage(languageParser);

  return filesByLanguage.map(file => {
    return {
      file: file.path,
      tree: parser.parse(readFileSync(file.path, "utf8"))
    };
  })
}

module.exports = {
  analyzeCodebase: analyzeCodebase
};