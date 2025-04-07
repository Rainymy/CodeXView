let canImportVSCode = false;

try {
  require("vscode");
  canImportVSCode = true;
} catch (err) {
  canImportVSCode = false;
}

function isVSCode() {
  return canImportVSCode;
}

module.exports = isVSCode;