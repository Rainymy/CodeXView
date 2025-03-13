const path = require("path");

/**
* @type {import("../language").languageEntry} LanguageEntry
*/
const entry = {
  name: "java",
  absolutePath: path.join(__dirname, "./tree-sitter-java.wasm")
};

module.exports = entry;