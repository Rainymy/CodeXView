const { Tree } = require("web-tree-sitter");

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

/**
* @param {Tree} tree
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
* @typedef {import("web-tree-sitter").Node} Node
* @param {Node} node
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

/**
* @param {Tree} tree
* @returns
*/
function syntaxTreeToJson_NEW(tree) {
  if (!tree || !tree.rootNode) {
    throw new Error("Invalid syntax tree");
  }

  /**
  * ✅ Helper function to recursively convert a SyntaxNode to JSON
  * @param {Node} node
  * @returns
  */
  function syntaxNodeToJson_NEW(node) {
    // TODO: CONVERT THIS INTO WHILE LOOP
    // (Recursively is bad idea with huge data)
    // if (node.childForFieldName("name")?.text) {
    //   console.log(node.childForFieldName("name")?.text)
    // }
    return {
      type: node.type,
      name: node.childForFieldName("name")?.text, // Extract raw text
      children: node.children.map(syntaxNodeToJson_NEW) // Recursively process children
    };
  }

  return syntaxNodeToJson_NEW(tree.rootNode);
}

module.exports = {
  analyzeCode: analyzeCode,
  syntaxTreeToJson: syntaxTreeToJson
  // syntaxTreeToJson: syntaxTreeToJson_NEW // <-- try this
};