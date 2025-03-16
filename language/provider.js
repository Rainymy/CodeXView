const { parse } = require("yaml");
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname);

const languagesYML = path.join(root, "languages.yml");
const heuristicsYML = path.join(root, "heuristics.yml");

const languagesContent = fs.readFileSync(languagesYML, "utf8");
const heuristicsContent = fs.readFileSync(heuristicsYML, "utf8");

/**
* To generate a types (d.ts) from JSON file.
* - online => https://jvilk.com/MakeTypes/
* - npmjs  => https://www.npmjs.com/package/maketypes
*/

/** @type {import("./language")}*/
const languages = parse(languagesContent);
/** @type {import("./heuristics").Heuristics} Heuristics*/
const heuristics = parse(heuristicsContent);

module.exports = {
  languages: languages,
  heuristics: heuristics
}