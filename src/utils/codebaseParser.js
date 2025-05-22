const fs = require("node:fs");
const { columns } = require("./fancyTitle");

const {
  filterByProgrammingLanguage,
  languagesSimpleStat
} = require('./detectLanguage');
const { loadAllFoldersWithIgnore } = require("../utils/ignoreRules");

const {
  getParser,
  getLanguageParser,
  doesLanguageParserExist
} = require("../../parsers/loader");

const { syntaxTreeToJson } = require("../../parsers/utils");

const pico = require("picocolors");
const { detectLanguagesInFiles } = require("linguist-sense");

/**
 * @typedef {import("linguist-sense").DetectLanguage} DetectLanguage
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
 * @typedef {import("./detectLanguage").FilterByLanguage} FilterByLanguage
 */

/**
 * @returns {Promise<ParsedFile[]|null>}
 */
async function analyzeCodebase() {
  const allFiles = loadAllFoldersWithIgnore((ignoredPath) => {
    console.log(" ├ Ignoring:", pico.yellow(ignoredPath));
  });
  console.log(` └${"─".repeat(columns - 2)}`);

  const detectedData = await detectLanguagesInFiles(allFiles);
  if (detectedData.failed.length) {
    console.log(pico.magenta("Failed to process files:"));
    for (const fail of detectedData.failed) {
      console.log(` ├ ${pico.red(fail.toString())}`);
    }
    console.log(` └${"─".repeat(columns - 2)}`);
  }

  const sourceFiles = await filterByProgrammingLanguage(
    allFiles,
    detectedData.failed,
  );
  if (sourceFiles.length === 0) {
    console.log("❌ Found No Programming Languages!");
    return null;
  }

  const langNames = languagesSimpleStat(
    sourceFiles.map(source => source.language)
  );

  console.log(`- 🔍 Detected languages: [ ${langNames.join(" ")} ]`);
  console.log(`- 📂 Found ${sourceFiles.length} source files.`);

  const syntaxTrees = langNames.reduce(
    (/** @type {ParsedFile[]} */ accum, lang) => {
      const filesByLanguage = sourceFiles.filter(({ language }) => language.name === lang);
      const langName = filesByLanguage[0].language.name;

      accum.push(...parseFilesForLanguage(filesByLanguage, langName));
      return accum;
    },
    [],
  );

  return syntaxTrees;
}

/**
* @param {FilterByLanguage[]} sourceFiles
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

  return sourceFiles.map(file => {
    const tree = parser.parse(fs.readFileSync(file.path, "utf8"));

    /** @type {ParsedFile} */
    const parsedObject = {
      file: file.path.toString(),
      tree: tree,
      json: syntaxTreeToJson(tree)
    }
    return parsedObject;
  });
}

module.exports = {
  analyzeCodebase: analyzeCodebase
};