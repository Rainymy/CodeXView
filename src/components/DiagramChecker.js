class DiagramObjects {
    /** @type {Number}   */ classCounter = 0;
    /** @type {String[]} */ classNames = [];

  async init(classCounter, classNames) {
    this.classCounter = classCounter;
    this.classNames = classNames;
  }
}
async function compareDiagramObjects(jsonObj, umlObj) {
  if (jsonObj.classCounter !== umlObj.classCounter) {
    return false;
  }

  if (!Array.isArray(jsonObj.classNames) || !Array.isArray(umlObj.classNames)) {
    return false;
  }

  const sortedJsonNames = [...jsonObj.classNames].sort();
  const sortedUmlNames = [...umlObj.classNames].sort();

  if (sortedJsonNames.length !== sortedUmlNames.length) {
    return false;
  }

  for (let i = 0; i < sortedJsonNames.length; i++) {
    if (sortedJsonNames[i] !== sortedUmlNames[i]) {
      return false;
    }
  }

  return true;
}

async function extractJSONInfo(code) {
  const classNames = [];
  const diagramObj = new DiagramObjects();

  function traverse(node) {
    if (node.type === "class_declaration" && node.name) {
      classNames.push(node.name);
    }
    if (Array.isArray(node.children)) {
      node.children.forEach(child => traverse(child));
    }
  }

  traverse(code);
  await diagramObj.init(classNames.length, classNames);
  return diagramObj;
}

async function extractJSONArrayInfo(treeArray) {
  const classNames = [];
  const diagramObj = new DiagramObjects();

  function traverse(node) {
    if (node.type === "class_declaration" && node.name) {
      classNames.push(node.name);
    }
    if (Array.isArray(node.children)) {
      node.children.forEach(child => traverse(child));
    }
  }

  // Traverse each SyntaxTreeJSON root node in the array
  for (const syntaxTree of treeArray) {
    traverse(syntaxTree);
  }

  await diagramObj.init(classNames.length, classNames);
  return diagramObj;
}

/**
* @param {String} umlString
* @returns
*/
async function extractClassInfoFromPlantUML(umlString) {
  const classRegex = /^\s*(abstract\s+)?class\s+(\w+)/gm;
  const diagramObj = new DiagramObjects();
  const classNames = [];
  let match = classRegex.exec(umlString);
  while (match !== null) {
    match = classRegex.exec(umlString);
    classNames.push(match[2]); // match[2] is the class name
  }
  await diagramObj.init(classNames.length, classNames);
  return diagramObj;
}

module.exports = {
  DiagramObjects,
  extractJSONInfo,
  extractClassInfoFromPlantUML,
  compareDiagramObjects,
  extractJSONArrayInfo
};