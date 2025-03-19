const vscode = require('vscode');

function getActiveDocumentFile() {
  const activeEditor = vscode.window.activeTextEditor;
  if (!activeEditor) {
    return null;
  }
  return activeEditor.document.uri.fsPath;
}

async function selectFileDialog() {
  const files = await vscode.window.showOpenDialog({
    canSelectMany: false,
    openLabel: 'Select a file to analyze',
    defaultUri: vscode.window.activeTextEditor?.document.uri
  });

  return files?.[0].fsPath ?? null;
}

function getWorkspaceFolder() {
  const workspace = vscode.workspace.workspaceFolders;
  if (workspace && workspace.length > 0) {
    return workspace[0].uri.fsPath;
  }
  return null;
}

module.exports = {
  selectFileDialog: selectFileDialog,
  getActiveDocumentFile: getActiveDocumentFile,
  getWorkspaceFolder: getWorkspaceFolder
};