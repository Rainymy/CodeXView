const path = require("path");

/**
* @type {import("../language").languageEntry} LanguageEntry
*/
const entry = {
  name: "ruby",
  absolutePath: path.join(__dirname, "./tree-sitter-ruby.wasm")
};

module.exports = entry;