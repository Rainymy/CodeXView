const path = require("path");
const { pathToBinary } = require("../provider");

/**
* @type {import("../language").languageEntry} LanguageEntry
*/
const entry = {
  absolutePath: path.join(pathToBinary, "./tree-sitter-java.node")
};

module.exports = entry;