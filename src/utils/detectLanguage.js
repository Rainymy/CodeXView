const path = require("node:path");
const fs = require("node:fs");

const { languages } = require("../../language/provider");
const { disambiguations } = require("./disambiguations");

/**
* @typedef {object} DetectLanguage
* @property  {String?} language
* @property  {String?} error
* @property  {String?} path
*/

/**
* @typedef {object} SimpleStats
* @property  {String[]} languages
* @property  {Number} languageCount
* @property  {String[]} colors
*/

/**
* @param {String} filePath
* @returns {DetectLanguage}
*/
function detectLanguageByPath(filePath) {
  if (!fs.existsSync(filePath)) {
    return detectedLanguage(null, filePath, "File does not exist.");
  }

  const language = getLanguage(filePath);

  if (language === undefined) {
    return detectedLanguage(null, filePath, "Unknown language.");
  }

  return detectedLanguage(language, filePath, null);
}

/**
* Creates `DetectLanguage` object only.
* @param {String} lang
* @param {String} path
* @param {String} error
* @returns {DetectLanguage}
*/
function detectedLanguage(lang, path, error) {
  return { language: lang, path: path, error: error }
}

/**
* This operation is expensive, use only when need to.
* @param {String} filePath
* @returns {String=}
*/
function getLanguage(filePath) {
  const dotExt = path.extname(path.basename(filePath));
  const ext = dotExt.substring(1);

  const similarLanguages = Object.keys(languages).filter(lang => {
    const correctExt = languages[lang].extensions?.includes(dotExt) ?? false;
    const correctAlias = languages[lang].aliases?.includes(ext) ?? false;

    return correctExt || correctAlias;
  });

  if (similarLanguages.length === 1) {
    return similarLanguages[0];
  }
  if (similarLanguages.length === 0) {
    return;
  }

  const language = disambiguations(dotExt, filePath);

  // No idea how or when {language.language} can be Array or null.
  return language.language?.toString() ?? "<NO NAME LANGUAGE>";
}

/**
* Returns detected language that type is `programming`.
* @param {DetectLanguage[]} langs
* @returns {DetectLanguage[]}
*/
function filterByProgrammingLanguage(langs) {
  return langs.filter((lg) => languages[lg.language].type === "programming");
}

/**
* @param {DetectLanguage[]} langs
* @returns {SimpleStats}
*/
function languagesSimpleStat(langs) {
  /** @type {String[]} */
  const uniqueLanguages = [...new Set(langs.map(d => d.language))];

  return {
    languages: uniqueLanguages,
    languageCount: uniqueLanguages.length,
    colors: [...uniqueLanguages].map((val) => languages[val].color)
  }
}

/**
* @param {DetectLanguage[]} langs
* @param {String} language
*/
function filterByLanguage(langs, language) {
  return langs.filter(val => val.language === language);
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

module.exports = {
  detectLanguageByPath: detectLanguageByPath,
  detectLanguagesInFiles: detectLanguagesInFiles,
  filterByProgrammingLanguage: filterByProgrammingLanguage,
  filterByLanguage: filterByLanguage,
  languagesSimpleStat: languagesSimpleStat
}