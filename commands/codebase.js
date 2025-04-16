const { compareDiagramObjects, extractClassInfoFromPlantUML, extractJSONArrayInfo } = require("../src/components/DiagramChecker");

const { generateCCDiagram, isValidPlantUMLCode } = require("../src/components/diagramGenerator");
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
  const diagramObj = await extractJSONArrayInfo(allSyntaxTreeJSON);
  console.log("Diagram Object:", diagramObj);
  let validUMLCode = "";
  let isNotCorrect = true;
  let attempts = 0;
  const maxAttempts = 5;

  while (isNotCorrect && attempts < maxAttempts) {
    attempts++;

    const diagram = await AIConnection.getChatResponse(allSyntaxTreeJSON);
    console.log("workspace diagram:", diagram);

    const umlObj = await extractClassInfoFromPlantUML(diagram);
    
    console.log("umlObj:", umlObj);
    const valid = await isValidPlantUMLCode(diagram);
    const matches = await compareDiagramObjects(diagramObj, umlObj);
    
    if (valid && matches) {
      isNotCorrect = false;
      validUMLCode = diagram;
    } else {
      console.log(`Attempt ${attempts}: Diagram did not pass validation.`);
      console.log("Valid:", valid);
      console.log("Matches:", matches);
      console.log("Diagram:", umlObj.classCounter);
      console.log("Parsed:", diagramObj.classCounter);
    }
  }

  if (!validUMLCode) {
    Notify.info("CodeXView! Failed to generate Diagram.");
    return;
  }

  // add diagram to project
  console.log("DiagramCode:", validUMLCode);
  const added = await generateCCDiagram(validUMLCode);

  if (!added) {
    Notify.error("CodeXView! Error adding diagram to project...");
    return;
  }

  Notify.info("CodeXView! Finished, Diagram has been added to your project...");
}

module.exports = codebaseAnalysis;