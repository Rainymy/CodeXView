const { readFileSync } = require("./fileHandler");
const { detectLanguageByPath } = require("./detectLanguage");

const { getParser, getLanguageParser } = require("../../parsers/loader.js");

/**
* @param {String} filePath
* @returns
*/
function analyzeCode(filePath) {
  const { language, error, path } = detectLanguageByPath(filePath);

  if (error) {
    console.log("❌ Found No Programming Languages!");
    return;
  }

  const languageParser = getLanguageParser(language);

  if (!languageParser) {
    console.warn(`⚠️  No parser available for language: ${language}`);
    return;
  }

  const parser = getParser();
  parser.setLanguage(languageParser);

  return parser.parse(readFileSync(path, "utf8"));
}

function syntaxTreeToJson(tree) {
  if (!tree || !tree.rootNode) {
    throw new Error("Invalid syntax tree");
  }
  return syntaxNodeToJson(tree.rootNode);
}

// ✅ Helper function to recursively convert a SyntaxNode to JSON
function syntaxNodeToJson(node) {
  // TODO: CONVERT THIS INTO WHILE LOOP
  // (Recursively is bad idea with huge data)
  return {
    type: node.type,
    text: node.text, // Extract raw text
    children: node.children.map(syntaxNodeToJson) // Recursively process children
  };
}

module.exports = {
  analyzeCode: analyzeCode,
  syntaxTreeToJson: syntaxTreeToJson
};