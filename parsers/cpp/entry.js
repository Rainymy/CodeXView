const path = require("path");

/**
* @type {import("../language").languageEntry} LanguageEntry
*/
const entry = {
  name: "cpp",
  absolutePath: path.join(__dirname, "./tree-sitter-cpp.wasm")
};

module.exports = entry;