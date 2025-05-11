const { detectLanguage } = require("linguist-sense");
/**
 * @typedef {import("linguist-sense").DetectLanguage} DetectLanguage
 * @typedef {import("fs").PathLike} PathLike
 */

/**
* @typedef {Object} FilterByLanguage
* @property {PathLike} path
* @property {DetectLanguage} language
*/

/**
* Returns detected language that type is `programming`.
* @param {String[]} allFiles
* @param {PathLike[]} failed
* @returns {Promise<FilterByLanguage[]>}
*/
async function filterByProgrammingLanguage(allFiles, failed) {
  const validPromises = allFiles
    .filter(item => !failed.includes(item))
    .map(item => resolveLanguage(item));

  const values = (await Promise.all(validPromises))
    .filter(Boolean)
    .filter(item => {
      return item.language.language.type === "programming";
    });

  return values
}

/**
* @param {PathLike} item
*/
async function resolveLanguage(item) {
  const hello = await detectLanguage(item);
  if (hello instanceof Error) {
    return;
  }
  return { path: item, language: hello };
}

/**
* @param {DetectLanguage[]} langs
* @returns {String[]}
*/
function languagesSimpleStat(langs) {
  return [...new Set(langs.map(d => d.name))];
}

/**
* @param {DetectLanguage[]} langs
* @param {String} language
*/
function filterByLanguage(langs, language) {
  return langs.filter(val => val.name === language);
}

module.exports = {
  filterByProgrammingLanguage: filterByProgrammingLanguage,
  languagesSimpleStat: languagesSimpleStat,
}