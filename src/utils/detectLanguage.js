const Csharp = require('tree-sitter-c-sharp');
const JavaScript = require('tree-sitter-javascript');
const Python = require('tree-sitter-python');
const C = require('tree-sitter-c');
const Java = require('tree-sitter-java');
const Cpp = require('tree-sitter-cpp');
const Ruby = require('tree-sitter-ruby');

/**
* @param {String} filePath
* @returns
*/
function detectLanguageByPath(filePath) {
  if (filePath.endsWith(".js")) return JavaScript;
  if (filePath.endsWith(".cs")) return Csharp;
  if (filePath.endsWith(".py")) return Python;
  if (filePath.endsWith(".c")) return C;
  if (filePath.endsWith(".java")) return Java;
  if (filePath.endsWith(".cpp")) return Cpp;
  if (filePath.endsWith(".rb")) return Ruby;
}

module.exports = {
  detectLanguageByPath: detectLanguageByPath,
  getLanguageParser: () => { }
}