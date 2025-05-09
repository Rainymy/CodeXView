const fs = require("node:fs");
const { Language } = require("web-tree-sitter");
const msgSeen = new Set();
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
 * @property {string} type
 * @property {string=} name
 * @property {string} text              //  ←  tell the checker this field exists
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
  return {
    type: node.type,
    name: node.childForFieldName("name")?.text,
    text: typeof node.text === "string" ? node.text : "",   // safe read
    children: node.children.map(syntaxNodeToJson)
  };
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

/**
 * Scan the AST for any `new` or object-creation nodes whose type matches one
 * of your classNames, and return that set of classes.
 *
 * @param {SyntaxTreeJSON[]} trees
 * @param {String[]} classNames
 * @returns {String[]}  an array of class names that were instantiated
 */
function extractInstantiatedClasses(trees, classNames) {
  const matches = new Set();

  function recurse(node) {
    if (node.type === "object_creation_expression") {
      for (const child of node.children) {
        if (child.type === "identifier") {
          const name = child.name || child.text;
          if (classNames.includes(name)) {
            matches.add(name);
          }
        }
      }
    }

    for (const child of node.children) {
      recurse(child);
    }
  }

  for (const tree of trees) {
    recurse(tree);
  }

  return Array.from(matches);
}

function simplifyAST(trees) {
  const info = harvestCollaborationInfo(trees);
  const associations = [];
  for (const [owner, dict] of info.fields.entries()) {
    for (const [varName, type] of dict.entries()) {
      associations.push({ owner, field: varName, type });
    }
  }
  return {
    classes: info.classes,
    associations,
    messages: info.messages,
    creations: info.creations
  };
}

/**
 * Returns an object
 * {
 *   classes: Set<string>,
 *   fields: Map<className, Map<varName, typeName>>,
 *   messages: Array<{caller, callee, verb}>,
 *   creations: Array<{creator, created}>
 * }
 */
function harvestCollaborationInfo(trees) {
  const classes   = new Set()
  const fields    = new Map()        // class  ⇒  Map(var , type)
  const messages  = []
  const creations = []

  /* first pass  collect every field and every class name */
  function scanClass(node) {
    if (node.type === "class_declaration" && node.name) {
      const owner = node.name
      classes.add(owner)
      const dict = new Map()
      fields.set(owner, dict)

      // look for field_declaration nodes inside this class
      walk(node, n => {
        if (n.type !== "field_declaration") return
        const varDecl = n.children.find(c => c.type === "variable_declaration")
        if (!varDecl) return

        const baseType = findFirstIdentifier(varDecl)
        if (!baseType) return

        // one field declaration can list several variables
        walk(varDecl, v => {
          if (v.type === "variable_declarator" && v.name) {
            dict.set(v.name, baseType)
          }
        })
      })
    }
    for (const c of node.children) scanClass(c)
  }

  /* second pass  detect messages and object creations */
  /* second pass – behaviour and creations */
function scanBehaviour(node, currentClass, locals = new Map()) {
  // environment inherited by the children
  let nextClass  = currentClass
  let nextLocals = locals

  // entering a class body
  if (node.type === "class_declaration" && node.name) {
    nextClass  = node.name
    nextLocals = new Map()
  }

  // local variable  (Type v = …)
  if (node.type === "local_declaration_statement") {
    const varDecl = node.children.find(c => c.type === "variable_declaration")
    if (varDecl) {
      const baseType = findFirstIdentifier(varDecl)
      walk(varDecl, v => {
        if (v.type === "variable_declarator" && v.name) {
          nextLocals.set(v.name, baseType)
        }
      })
    }
  }

  // new Something()  ⇒  creation edge
  if (node.type === "object_creation_expression") {
    const created = findFirstIdentifier(node)       // works even when nested
    if (nextClass && created) {
      creations.push({ creator: nextClass, created })
    }
  }

  // obj.method()  or  obj?.method()  ⇒  message edge
  if (node.type === "invocation_expression") {
    // pick the access form that is present
    const member =
          node.children.find(c => c.type === "member_access_expression") ||
          node.children.find(c => c.type === "conditional_access_expression")

    if (member) {
      let objNode
      let verbNode

      // plain dot call
      if (member.type === "member_access_expression" && member.children.length === 3) {
        [objNode, , verbNode] = member.children
      }

      // null-conditional call
      if (member.type === "conditional_access_expression") {
        objNode = member.children[0]                         // before ?
        const bind = member.children.find(
                       c => c.type === "member_binding_expression")
        verbNode = bind?.children.find(c => c.type === "identifier")
      }

      if (objNode && verbNode) {
        const objName  = objNode.name  || objNode.text
        const verbName = verbNode.name || verbNode.text

        const targetType =
              nextLocals.get(objName) ||
              (fields.get(nextClass) || new Map()).get(objName)

        const sig = `${nextClass}→${targetType}.${verbName}`   // dedupe key
        if (nextClass && targetType && !msgSeen.has(sig)) {
          messages.push({ caller: nextClass, callee: targetType, verb: verbName })
          msgSeen.add(sig)
        }
      }
    }
  }

  // recurse
  for (const c of node.children) scanBehaviour(c, nextClass, nextLocals)
}

  for (const t of trees) scanClass(t)
  for (const t of trees) scanBehaviour(t, null)

  return { classes: Array.from(classes), fields, messages, creations }
}


// generic tree walker
function walk(node, visit) {
  visit(node)
  for (const c of node.children) walk(c, visit)
}

// return the first identifier token that lies under node
function findFirstIdentifier(node) {
  let name = null
  walk(node, n => {
    if (!name && n.type === "identifier") {
      name = n.name || n.text
    }
  })
  return name
}

module.exports = {
  createDiagramObject: createDiagramObject,
  loadEntry: loadEntry,
  depthFirstTree: depthFirstTree,
  syntaxTreeToJson: syntaxTreeToJson,
  extractNodesInfo: extractNodesInfo,
  extractNodeInfo: extractNodeInfo,
  extractInstantiatedClasses,
  simplifyAST,
  harvestCollaborationInfo
}