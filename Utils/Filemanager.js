const vscode = require('vscode');

async function analyzeFile() {
    let filePath = getActiveFile(); // Try to get the opened file
    if (!filePath) {
        filePath = await getSelectedFile(); // If no file is open, try selecting one
    }
    return filePath;
}

function getActiveFile() {
    const activeEditor = vscode.window.activeTextEditor;
    if (!activeEditor) {
        vscode.window.showErrorMessage('No file is currently open.');
        return null;
    }
    return activeEditor.document.uri.fsPath;
}

async function getSelectedFile() {
    const files = await vscode.window.showOpenDialog({
        canSelectMany: false,
        openLabel: 'Select a file to analyze',
        defaultUri: vscode.window.activeTextEditor ? vscode.window.activeTextEditor.document.uri : undefined
    });

    if (!files || files.length === 0) {
        vscode.window.showErrorMessage('No file selected.');
        return null;
    }

    return files[0].fsPath;
}

module.exports = { analyzeFile };