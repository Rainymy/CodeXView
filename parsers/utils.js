const fs = require("node:fs");
const { Language } = require("web-tree-sitter");

/**
* @typedef {import("web-tree-sitter").Node} Node
*/

/**
 * @typedef {import('./language').LoadEntry} LoadEntry
 * @typedef {import('web-tree-sitter').Tree} Tree
 */

/**
* @typedef {Object} SyntaxTreeJSON
* @property {String} type
* @property {String=} name
* @property {SyntaxTreeJSON[]} children
*/

/**
* @param {String} entryFile
* @returns {Promise<LoadEntry>}
*/
async function loadEntry(entryFile) {
  try {
    return { entry: await loadParserWASM(entryFile), error: null };
  }
  catch (err) {
    return { entry: null, error: err };
  }
}

/**
* @param {String} pathFs
* @returns {Promise<Language>}
*/
async function loadParserWASM(pathFs) {
  const data = new Uint8Array(fs.readFileSync(pathFs));
  return await Language.load(data);
}

/**
* @param {Tree} tree
* @returns {SyntaxTreeJSON}
* @throws if param is not a syntax `Tree`
*/
function syntaxTreeToJson(tree) {
  if (!tree || !tree.rootNode) {
    throw new Error("Invalid syntax tree");
  }
  return syntaxNodeToJson(tree.rootNode);
}

/**
* @param {Node} node
* @returns {SyntaxTreeJSON}
*/
function syntaxNodeToJson(node) {
  // TODO: CONVERT THIS INTO WHILE LOOP
  return {
    type: node.type,
    // text: node.text,
    name: node.childForFieldName("name")?.text,
    children: node.children.map(syntaxNodeToJson)
  }
}

module.exports = {
  loadEntry: loadEntry,
  syntaxTreeToJson: syntaxTreeToJson
}