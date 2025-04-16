/**
* @param {import("../../parsers/utils").DiagramObjects} jsonObj
* @param {import("../../parsers/utils").DiagramObjects} umlObj
* @returns {Boolean}
*/
function compareDiagramObjects(jsonObj, umlObj) {
  if (jsonObj.classCounter !== umlObj.classCounter) {
    return false;
  }

  const sortedJsonNames = [...jsonObj.classNames].sort();
  const sortedUmlNames = [...umlObj.classNames].sort();

  for (let i = 0; i < sortedJsonNames.length; i++) {
    if (sortedJsonNames[i] !== sortedUmlNames[i]) {
      return false;
    }
  }

  return true;
}

module.exports = {
  compareDiagramObjects: compareDiagramObjects
}