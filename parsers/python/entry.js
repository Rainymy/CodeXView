const path = require("path");

/**
* @type {import("../language").languageEntry} LanguageEntry
*/
const entry = {
  name: "python",
  absolutePath: path.join(__dirname, "./tree-sitter-python.wasm")
};

module.exports = entry;