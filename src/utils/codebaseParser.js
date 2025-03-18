const ProjectConfig = require('../components/ProjectConfig');

const path = require("path");

const {
  detectLanguageByPath,
  filterByProgrammingLanguage,
  languagesSimpleStat
} = require('../utils/detectLanguage');
const { getParser, load_parsers } = require("../../parsers/loader");

const { loadAllFoldersWithIgnore, loadIgnoreRules } = require("../utils/ignoreRules");

// Use github linguest package to identify/analys projact.
async function parseCodeBase() {
  const validFiles = loadAllFoldersWithIgnore(false);

  const lang = detectLanguagesInFiles(validFiles);
  const programmings = filterByProgrammingLanguage(lang.detected);

  if (programmings.length === 0) {
    console.log("❌ Found No Programming Languages!");
    return null
  };

  // if (detectedLanguages.size === 0) {
  //   console.log("❌ No programming files detected in the folder.");
  //   return null;
  // }

  // if (detectedLanguages.size > 1) {
  //   console.log("❌ Multiple programming languages found. Only one is allowed.");
  //   return null;
  // }

  const langStats = languagesSimpleStat(programmings);
  console.log(`🔍 Detected languages: [ ${langStats.languages.join((" "))} ]`);

  // const parser = getParser();
  // parser.setLanguage(lang);

  console.log(`📂 Found ${programmings.length} files.`);

  // ✅ Parse all matching files
  // const parsedTrees = matchingFiles.map(file => ({
  //   file,
  //   tree: parser.parse(fs.readFileSync(file, "utf8"))
  // }));

  // return parsedTrees;
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