// The module 'vscode' contains the VS Code extensibility API

const {parseCode, parseCodeBase} = require('./Components/codeParser');
const {analyzeFile, getWorkspaceFolder} = require('./Utils/Filemanager');
const {generateCCDDiagram} = require('./Components/diagramGenerator');
const path = require("path");
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "codexview" is now active!');
	var parsedCode;
	//var AIConnection = new AIConnection();
	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
	const disposable = vscode.commands.registerCommand('codexview.run', async function () {
		// The code you place here will be executed every time your command is executed

		// Display a message box to the user
		var selectedFile =  await analyzeFile();
		vscode.window.showInformationMessage('CodeXView! Found File...');

		if(selectedFile.length > 0){
			console.log("SelectedFile:" , selectedFile);
			
			const folderPath = path.dirname(selectedFile);
			const folderName = path.basename(folderPath);
			console.log("Folder Path:", folderPath);

			
			vscode.window.showInformationMessage('CodeXView! Started...');

			parsedCode = await parseCode(selectedFile);

			console.log("ParsedCode" ,parsedCode.printDotGraph())
			
			//ta ut information från parsade koden, som fil count och namn, functions count+namn 
			// och samma för variabler till resultats checkning
			
			// skicka parsedCode till AI
			var diagramCode;
			// kolla om det stämmer
		
			// add diagram to project
			await addDiagramToProject(diagramCode, folderPath, folderName);
			

		} else {
			vscode.window.showErrorMessage('No file selected.');
		}

	});

	const disposable2 = vscode.commands.registerCommand("codexview.runmultiple", async function () {
		try {
			var folder = await getWorkspaceFolder();
			if (!folder) {
				vscode.window.showErrorMessage("❌ No workspace folder found.");
				return;
			}
	
			vscode.window.showInformationMessage("🔍 CodeXView! Found Codebase...");
			vscode.window.showInformationMessage("🚀 CodeXView! Started...");
			
			const folderName = path.basename(folder);
			const parsedCode = await parseCodeBase(folder);
	
			if (!parsedCode) {
				vscode.window.showErrorMessage("❌ Code parsing failed.");
				return;
			}
	
			console.log("Parsed Code:", parsedCode);
			let diagramCode = "";
			
		
			await addDiagramToProject(diagramCode, folder, folderName);
	
		} catch (error) {
			vscode.window.showErrorMessage(`❌ Error: ${error.message}`);
			console.error(error);
		}
	});

	async function addDiagramToProject(diagramCode, folderPath, folderName){
		var added = await generateCCDDiagram(diagramCode, folderPath,folderName);
		if(added){
			vscode.window.showInformationMessage('CodeXView! Finnished, Diagram has been added to your project...');
		} else{
			vscode.window.showErrorMessage('CodeXView! Error adding diagram to project...');
		}
	}

	context.subscriptions.push(disposable, disposable2);
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}


