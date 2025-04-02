const fs = require("node:fs");
const path = require("node:path");

const { parse } = require("yaml");
const { toRegExp } = require("oniguruma-to-es");

const LanguageFilename = "languages.yml";
const HeuristicsFilename = "heuristics.yml";

/**
* To generate a types (d.ts) from JSON file.
* - online => https://jvilk.com/MakeTypes/
* - npmjs  => https://www.npmjs.com/package/maketypes
*/

/**
* @param {String} filename
* @returns
*/
function readYMLFile(filename) {
  return fs.readFileSync(path.join(__dirname, filename), "utf8");
}

/**
* @param {String|String[]} patterns
* @returns {RegExp}
*/
function convertToJSRegex(patterns) {
  const reg = Array.isArray(patterns)
    ? patterns.join("|")
    : patterns;

  return toRegExp(reg, { accuracy: "strict" });
}

module.exports = {
  /** @type {import("./language").Language} Language */
  languages: parse(readYMLFile(LanguageFilename)),
  /** @type {import("./heuristics").Heuristics} Heuristics*/
  heuristics: parse(readYMLFile(HeuristicsFilename)),
  convertToJSRegex: convertToJSRegex
}