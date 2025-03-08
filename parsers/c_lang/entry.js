const path = require("path");
const { pathToBinary } = require("../provider");

/**
* @type {import("../language").languageEntry} LanguageEntry
*/
const entry = {
  absolutePath: path.join(pathToBinary, "./tree-sitter-c.node")
};

module.exports = entry;