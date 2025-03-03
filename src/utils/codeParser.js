const Parser = require("tree-sitter");
const { customReadStream: readStream } = require("./fileHandler")
const { detectLanguageByPath } = require("./detectLanguage")

/**
* @param {String} filePath
* @returns
*/
async function parseCode(filePath) {
  const parser = new Parser();
  const lang = detectLanguageByPath(filePath);
  parser.setLanguage(lang);

  return parser.parse(await readStream(filePath));
}

/**
* @param {Parser.Tree} tree
* @returns
*/
function syntaxTreeToJson(tree) {
  if (!tree || !tree.rootNode) {
    throw new Error("Invalid syntax tree");
  }
  return syntaxNodeToJson(tree.rootNode);
}

/**
* ✅ Helper function to recursively convert a SyntaxNode to JSON
* @param {Parser.SyntaxNode} node
* @returns
*/
function syntaxNodeToJson(node) {
  // TODO: CONVERT THIS INTO WHILE LOOP
  // (Recursively is bad idea with huge data)
  return {
    type: node.type,
    text: node.text, // Extract raw text
    children: node.children.map(syntaxNodeToJson) // Recursively process children
  };
}
module.exports = { parseCode, syntaxTreeToJson };