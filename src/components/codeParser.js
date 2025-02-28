const Parser = require("tree-sitter");
const { customReadStream: readStream } = require("../utils/fileHandler")
const { detectLanguageByPath } = require("../utils/detectLanguage")

/**
* @param {String} filePath
* @returns
*/
async function parseCode(filePath) {
  const parser = new Parser();
  const lang = detectLanguageByPath(filePath);
  parser.setLanguage(lang);

  const tree = parser.parse(await readStream(filePath));
  return tree
}

function syntaxTreeToJson(tree) {
  if (!tree || !tree.rootNode) {
    throw new Error("Invalid syntax tree");
  }
  return syntaxNodeToJson(tree.rootNode);
}

// ✅ Helper function to recursively convert a SyntaxNode to JSON
function syntaxNodeToJson(node) {
  return {
    type: node.type,
    text: node.text, // Extract raw text
    children: node.children.map(syntaxNodeToJson) // Recursively process children
  };
}
module.exports = { parseCode, syntaxTreeToJson };