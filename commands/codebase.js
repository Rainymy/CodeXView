const { analyzeCodebase } = require("../src/utils/codebaseParser");
const { getWorkspaceFolder } = require('../src/utils/activeDocument');
const { loadIgnoreRules } = require("../src/utils/ignoreRules");

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

  try {
    loadIgnoreRules(); // Temporary placement.

    const parsedCode = await analyzeCodebase();

    if (!parsedCode) {
      Notify.error("❌ Code parsing failed.");
      return;
    }

    console.log("Parsed Code:", parsedCode);
    // let diagramCode = "";

    // await addDiagramToProject(diagramCode, folder, folderName);
  } catch (error) {
    Notify.error(`❌ Error: ${error.message}`);
    console.error(error);
  }
}

module.exports = codebaseAnalysis;