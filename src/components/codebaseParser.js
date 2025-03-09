const Parser = require('tree-sitter');

const fs = require('fs');
const vscode = require('vscode');
const path = require("path");

const { detectLanguageByPath } = require('../utils/detectLanguage');

// Use github linguest package to identify/analys projact.
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
  const exclude = ["node_modules", ".git", "dist"];
  const include = [".js", ".cs", ".py", ".c", ".java", ".cpp", ".rb"];
  const matchingFiles = getAllFiles(folderPath, include, exclude)
    .filter(file => detectLanguageByPath(file) === lang);

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
    const lang = detectLanguageByPath(file);
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


module.exports = { parseCodeBase };