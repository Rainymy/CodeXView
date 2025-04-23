const fs = require("node:fs");
const { columns } = require("./fancyTitle");

const {
  filterByProgrammingLanguage,
  filterByLanguage,
  languagesSimpleStat,
  detectLanguagesInFiles
} = require('./detectLanguage');
const { loadAllFoldersWithIgnore } = require("../utils/ignoreRules");

const {
  getParser,
  getLanguageParser,
  doesLanguageParserExist
} = require("../../parsers/loader");

const { syntaxTreeToJson } = require("../../parsers/utils");

const pico = require("picocolors");

/**
* @typedef {import("./detectLanguage").DetectLanguage} DetectLanguage
* @typedef {import("../../parsers/utils").SyntaxTreeJSON} SyntaxTreeJSON
* @typedef {import("web-tree-sitter").Tree} Tree
*/

/**
* @typedef {object} ParsedFile
* @property  {String} file - File path
* @property  {Tree?} tree - Parsed syntax tree
* @property  {SyntaxTreeJSON} json - Parsed JSON syntax tree
*/

/**
* @returns {Promise<ParsedFile[]|null>}
*/
async function analyzeCodebase() {
  const allFiles = loadAllFoldersWithIgnore(ignoredPath => {
    console.log(" ├ Ignoring:", pico.yellow(ignoredPath));
  });
  console.log(` └${"─".repeat(columns - 2)}`);

  const detectedData = detectLanguagesInFiles(allFiles);
  if (detectedData.failed.length) {
    console.log(pico.magenta("Failed to process files:"));
    for (const fail of detectedData.failed) {
      console.log(` ├ ${pico.red(fail.path)}`);
    }
    console.log(` └${"─".repeat(columns - 2)}`);
  }

  const sourceFiles = filterByProgrammingLanguage(detectedData.detected);
  if (sourceFiles.length === 0) {
    console.log("❌ Found No Programming Languages!");
    return null;
  }

  const langStats = languagesSimpleStat(sourceFiles);
  const detectedLanguages = langStats.languages.join(" ");

  console.log(`- 🔍 Detected languages: [ ${detectedLanguages} ]`);
  console.log(`- 📂 Found ${sourceFiles.length} source files.`);

  const syntaxTrees = langStats.languages.reduce((
      /** @type {ParsedFile[]} */ accum, language
  ) => {
    const filesByLanguage = filterByLanguage(sourceFiles, language);
    const fileLang = filesByLanguage[0].language;

    accum.push(...parseFilesForLanguage(filesByLanguage, fileLang));
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
  if (!doesLanguageParserExist(language)) {
    console.warn(`⚠️  No parser available for language: ${language}`);
    return [];
  }

  const parser = getParser();
  parser.setLanguage(getLanguageParser(language));

  return filterByLanguage(sourceFiles, language).map(file => {
    const tree = parser.parse(fs.readFileSync(file.path, "utf8"));

    /** @type {ParsedFile} */
    const parsedObject = {
      file: file.path,
      tree: tree,
      json: syntaxTreeToJson(tree)
    }
    return parsedObject;
  });
}

module.exports = {
  analyzeCodebase: analyzeCodebase
};