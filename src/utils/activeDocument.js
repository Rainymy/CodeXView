const vscode = require('vscode');

function getActiveDocumentFile() {
  const activeEditor = vscode.window.activeTextEditor;
  if (!activeEditor) {
    vscode.window.showErrorMessage('No file is currently open.');
    return null;
  }
  return activeEditor.document.uri.fsPath;
}

async function selectFile() {
  const files = await vscode.window.showOpenDialog({
    canSelectMany: false,
    openLabel: 'Select a file to analyze',
    defaultUri: vscode.window.activeTextEditor
      ? vscode.window.activeTextEditor.document.uri
      : undefined
  });

  if (!files || files.length === 0) {
    vscode.window.showErrorMessage('No file selected.');
    return null;
  }

  return files[0].fsPath;
}

async function fetchFileToAnalyze() {
  return getActiveDocumentFile() ?? await selectFile();
}

module.exports = {
  fetchFileToAnalyze: fetchFileToAnalyze,
  getActiveDocumentFile: getActiveDocumentFile,
};