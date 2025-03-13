const path = require("path");

/**
* @type {import("../language").languageEntry} LanguageEntry
*/
const entry = {
  name: "csharp",
  absolutePath: path.join(__dirname, "./tree-sitter-c_sharp.wasm")
};

module.exports = entry;