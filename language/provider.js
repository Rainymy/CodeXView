const fs = require("fs");
const path = require("path");

const { parse } = require("yaml");

/**
* To generate a types (d.ts) from JSON file.
* - online => https://jvilk.com/MakeTypes/
* - npmjs  => https://www.npmjs.com/package/maketypes
*/

/** @type {import("./language")}*/
const languages = parse(fs.readFileSync(path.join(__dirname, "languages.yml"), "utf8"));
/** @type {import("./heuristics").Heuristics} Heuristics*/
const heuristics = parse(fs.readFileSync(path.join(__dirname, "heuristics.yml"), "utf8"));

module.exports = {
  languages: languages,
  heuristics: heuristics
}