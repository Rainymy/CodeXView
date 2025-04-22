const fs = require("node:fs");
const { Language } = require("web-tree-sitter");

/**
* @typedef {import("web-tree-sitter").Node} Node
* @typedef {import("../src/utils/IDGenerator")} IDGenerator
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
* @typedef {Object} DiagramObjects
* @property {Number} classCounter
* @property {String[]} classNames
*/

/**
* @typedef {Object} DepthFirstTree
* @property {String} path
* @property {String} id
* @property {String?} name
* @property {String} type
*/

/**
* @param {String[]} classNames
* @returns {DiagramObjects}
*/
function createDiagramObject(classNames) {
  return {
    classCounter: classNames.length,
    classNames: classNames
  }
}

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

/**
*
* @param {SyntaxTreeJSON} node
* @param {IDGenerator} idGenerator
* @param {String?} parentPath
* @returns {DepthFirstTree[]}
*/
function depthFirstTree(node, idGenerator, parentPath = null) {
  const id = idGenerator.generate();
  /** @type {DepthFirstTree[]} */
  const result = [
    {
      path: parentPath ?? "",
      id: id,
      name: node.name,
      type: node.type
    }
  ];

  const path = parentPath ? `${parentPath} > ${id}` : id;
  for (const child of node.children) {
    result.push(...depthFirstTree(child, idGenerator, path));
  }

  return result;

}

/**
* @param {SyntaxTreeJSON[]} treeArray
* @returns
*/
function extractNodesInfo(treeArray) {
  const classNames = [];

  /** @param {SyntaxTreeJSON} node */
  function traverse(node) {
    // pretty sure this only extract only class names
    if (node.type === "class_declaration" && node.name) {
      classNames.push(node.name);
    }
    node.children.map(traverse);
  }

  // Traverse each SyntaxTreeJSON root node in the array
  for (const syntaxTree of treeArray) {
    traverse(syntaxTree);
  }

  return createDiagramObject(classNames);
}

/**
* @param {SyntaxTreeJSON} tree
* @returns
*/
function extractNodeInfo(tree) {
  return extractNodesInfo([tree]);
}

module.exports = {
  createDiagramObject: createDiagramObject,
  loadEntry: loadEntry,
  depthFirstTree: depthFirstTree,
  syntaxTreeToJson: syntaxTreeToJson,
  extractNodesInfo: extractNodesInfo,
  extractNodeInfo: extractNodeInfo
}