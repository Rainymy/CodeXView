const path = require("path");
const { pathToBinary } = require("../provider");

/**
* @type {import("../language.d.ts").languageEntry} LanguageEntry
*/
const entry = {
  absolutePath: path.join(pathToBinary, "./tree-sitter-python.node")
};

module.exports = entry;