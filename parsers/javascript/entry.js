const path = require("path");

/**
* @type {import("../language").languageEntry} LanguageEntry
*/
const entry = {
  name: "javascript",
  absolutePath: path.join(__dirname, "./tree-sitter-javascript.wasm")
};

module.exports = entry;