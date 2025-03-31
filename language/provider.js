const fs = require("node:fs");
const path = require("node:path");

const { parse } = require("yaml");

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

/** @type {import("./language").Language} Language */
const languages = parse(readYMLFile("languages.yml"));
/** @type {import("./heuristics").Heuristics} Heuristics*/
const heuristics = parse(readYMLFile("heuristics.yml"));

module.exports = {
  languages: languages,
  heuristics: heuristics
}