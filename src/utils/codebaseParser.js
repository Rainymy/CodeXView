const ProjectConfig = require('../components/ProjectConfig');

const path = require("path");
const fs = require("fs");

const {
  detectLanguageByPath,
  filterByProgrammingLanguage,
  filterByLanguage,
  languagesSimpleStat
} = require('../utils/detectLanguage');
const {
  getParser,
  load_parsers,
  getLanguageParser
} = require("../../parsers/loader");

const {
  loadAllFoldersWithIgnore,
  loadIgnoreRules
} = require("../utils/ignoreRules");

/**
* @typedef {import("./detectLanguage").DetectLanguage} DetectLanguage
*/

/**
* @typedef {object} ParsedFile
* @property  {String} file - File path
* @property  {import("web-tree-sitter").Tree?} tree - Parsed syntax tree
*/

// Use github linguest package to identify/analys projact.
async function parseCodeBase() {
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
    return [...accum, ...parseFilesForLanguage(sourceFiles, language)];
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
      tree: parser.parse(fs.readFileSync(file.path, "utf8"))
    };
  })
}

/**
* @param {String[]} files
* @returns
*/
function detectLanguagesInFiles(files) {
  const detectedLanguages = [];
  const failedLanguages = [];

  for (const file of files) {
    const detected = detectLanguageByPath(file);
    if (detected.error) {
      failedLanguages.push(detected);
      continue;
    }
    detectedLanguages.push(detected);
  }

  return {
    detected: detectedLanguages,
    failed: failedLanguages
  }
}

// (async () => {
//   await load_parsers();

//   const rootPath = path.join(__dirname, "../../");
//   ProjectConfig.load(path.join(rootPath, "config.jsonc"));
//   ProjectConfig.setRootPath(rootPath);

//   loadIgnoreRules(); // load ignore rules via root path.
//   parseCodeBase();
// })()

module.exports = { parseCodeBase };