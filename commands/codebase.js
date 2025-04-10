const AIConnection = require("../src/components/AIConnection");

const { readPrompt } = require("../src/utils/fileHandler");
const { analyzeCodebase } = require("../src/utils/codebaseParser");
const { loadIgnoreRules } = require("../src/utils/ignoreRules");

const { getWorkspaceFolder } = require('../src/fallbacks/activeDocument');

const { Notify, parseSetup } = require("./vsUtil");

async function codebaseAnalysis() {
  const folder = getWorkspaceFolder();
  if (!folder) {
    Notify.error("❌ No workspace folder found.");
    return;
  }

  if (!parseSetup(folder)) {
    Notify.error("⚠️ Problem with permission!");
    return;
  }

  Notify.info("🔍 CodeXView! Found Codebase...");

  loadIgnoreRules(); // Temporary placement.

  const parsedCode = await analyzeCodebase();

  if (!parsedCode && parsedCode.length === 0) {
    Notify.error("❌ Code parsing failed.");
    return;
  }

  console.log("Parsed Code:", parsedCode);

  AIConnection.setPrompt(readPrompt());

  const allSyntaxTreeJSON = parsedCode.map(v => v.json);
  const diagram = await AIConnection.getChatResponse(allSyntaxTreeJSON);
  console.log("workspace diagram:", diagram);

  if (!diagram) {
    Notify.error("CodeXView! Error adding diagram to project...")
    return;
  }
  Notify.info("CodeXView! Finnished, Diagram has been added to your project...");
}

module.exports = codebaseAnalysis;