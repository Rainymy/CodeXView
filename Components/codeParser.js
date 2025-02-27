const Parser = require('tree-sitter');
const Csharp = require('tree-sitter-c-sharp');
const JavaScript = require('tree-sitter-javascript');
const Python = require('tree-sitter-python');
const C = require('tree-sitter-c');
const Java = require('tree-sitter-java');
const Cpp = require('tree-sitter-cpp');
const Ruby = require('tree-sitter-ruby');

const fs = require('fs');

async function parseCode(filePath) {
    JavaScript.language
    const parser = new Parser();
    var lang = detectLanguage(filePath);
    parser.setLanguage(lang);
    const tree = parser.parse(fs.readFileSync(filePath, 'utf8'));
    return tree
}

function detectLanguage(filePath){
    if(filePath.endsWith(".js")){
        return JavaScript;
    }
    if(filePath.endsWith(".cs")){
        return Csharp;
    }
    if(filePath.endsWith(".py")){
        return Python;
    }
    if(filePath.endsWith(".c")){
        return C;
    }
    if(filePath.endsWith(".java")){
        return Java;
    }
    if(filePath.endsWith(".cpp")){
        return Cpp;
    }
    if(filePath.endsWith(".rb")){
        return Ruby;
    }
}

function syntaxTreeToJson(tree) {
    if (!tree || !tree.rootNode) {
        throw new Error("Invalid syntax tree");
    }
    return syntaxNodeToJson(tree.rootNode);
}

// ✅ Helper function to recursively convert a SyntaxNode to JSON
function syntaxNodeToJson(node) {
    return {
        type: node.type,
        text: node.text, // Extract raw text
        children: node.children.map(syntaxNodeToJson) // Recursively process children
    };
}
module.exports = { parseCode, syntaxTreeToJson }; 