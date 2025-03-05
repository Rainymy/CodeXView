const Parser = require('tree-sitter');
const Csharp = require('tree-sitter-c-sharp');
const JavaScript = require('tree-sitter-javascript');
const Python = require('tree-sitter-python');
const C = require('tree-sitter-c');
const Java = require('tree-sitter-java');
const Cpp = require('tree-sitter-cpp');
const Ruby = require('tree-sitter-ruby');

const fs = require('fs');
const vscode = require('vscode');
const path = require("path");

async function parseCode(filePath) {
    const parser = new Parser();
    var lang = detectLanguage(filePath);
    parser.setLanguage(lang);
    const tree = parser.parse(fs.readFileSync(filePath, 'utf8'));
    return tree
}

async function parseCodeBase(folderPath) {
    if (!fs.existsSync(folderPath) || !fs.statSync(folderPath).isDirectory()) {
        throw new Error("❌ Invalid folder path");
    }

    // ✅ Detect language
    const lang = detectLanguageInFolder(folderPath);
    if (!lang) return null; // Stops execution if multiple languages exist

    console.log(`🔍 Detected language: ${lang.name}`);

    const parser = new Parser();
    parser.setLanguage(lang);

    // ✅ Get all files recursively and exclude unnecessary folders
    const matchingFiles = getAllFiles(folderPath, [".js", ".cs", ".py", ".c", ".java", ".cpp", ".rb"], ["node_modules", ".git", "dist"])
        .filter(file => detectLanguage(file) === lang);

    if (matchingFiles.length === 0) {
        throw new Error("❌ No valid files found.");
    }

    console.log(`📂 Found ${matchingFiles.length} files matching ${lang.name}`);

    // ✅ Parse all matching files
    const parsedTrees = matchingFiles.map(file => ({
        file,
        tree: parser.parse(fs.readFileSync(file, "utf8"))
    }));

    return parsedTrees;
}


function getAllFiles(dirPath, extensions = [], excludeFolders = [], fileList = []) {
    const files = fs.readdirSync(dirPath);

    for (const file of files) {
        const fullPath = path.join(dirPath, file);

        if (fs.statSync(fullPath).isDirectory()) {
            if (!excludeFolders.includes(file)) { // ✅ Skip unwanted directories
                getAllFiles(fullPath, extensions, excludeFolders, fileList);
            }
        } else if (extensions.length === 0 || extensions.some(ext => file.endsWith(ext))) {
            fileList.push(fullPath); // ✅ Add only valid files
        }
    }

    return fileList;
}

function detectLanguageInFolder(folderPath) {
    const files = getAllFiles(folderPath, [".js", ".cs", ".py", ".c", ".java", ".cpp", ".rb"], ["node_modules", ".git", "dist", ".md", ".env"]);
    const detectedLanguages = new Set();

    files.forEach(file => {
        const lang = detectLanguage(file);
        if (lang) detectedLanguages.add(lang);
    });

    if (detectedLanguages.size === 0) {
        vscode.window.showErrorMessage("❌ No programming files detected in the folder.");
        return null;
    }

    if (detectedLanguages.size > 1) {
        vscode.window.showErrorMessage("❌ Multiple programming languages found. Only one is allowed.");
        return null;
    }

    return [...detectedLanguages][0]; // ✅ Returns the detected language
}

function detectLanguage(filePath) {
    if (filePath.endsWith(".js")) return JavaScript;
    if (filePath.endsWith(".cs")) return Csharp;
    if (filePath.endsWith(".py")) return Python;
    if (filePath.endsWith(".c")) return C;
    if (filePath.endsWith(".java")) return Java;
    if (filePath.endsWith(".cpp")) return Cpp;
    if (filePath.endsWith(".rb")) return Ruby;
    return null;
}


module.exports = { parseCode, parseCodeBase }; 