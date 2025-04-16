const { extractJSONInfo, compareDiagramObjects, extractClassInfoFromPlantUML } = require("../src/components/DiagramChecker");

const path = require("node:path");

const { readPrompt } = require('../src/utils/fileHandler');
const { analyzeCode } = require('../src/utils/codeParser');

const { generateCCDiagram, isValidPlantUMLCode } = require('../src/components/diagramGenerator');

const { getActiveDocumentFile, selectFileDialog } = require('../src/fallbacks/activeDocument');

const { syntaxTreeToJson } = require("../parsers/utils");
const { Notify, parseSetup } = require("./vsUtil");

const AIConnection = require("../src/components/AIConnection");

async function fileAnalysis() {
  const selectedFile = getActiveDocumentFile() ?? await selectFileDialog();

  if (!selectedFile) {
    Notify.error('No active document found / No file selected.');
    return;
  }

  Notify.info('CodeXView! Found File...');

  if (!parseSetup(path.dirname(selectedFile))) {
    Notify.error("⚠️ Problem with permission!");
    return;
  }
  const parsedCode = analyzeCode(selectedFile);
  const parsedJson = syntaxTreeToJson(parsedCode);
 
  const diagramObj = await extractJSONInfo(parsedJson);
  
  Notify.info('CodeXView! Processing......');

  AIConnection.setPrompt(readPrompt());

  let validUMLCode = "";
  let isNotCorrect = true;
  let attempts = 0;
  const maxAttempts = 5;

  while (isNotCorrect && attempts < maxAttempts) {
    attempts++;

    const diagram = await AIConnection.getChatResponse(parsedJson);
    console.log("workspace diagram:", diagram);

    const umlObj = await extractClassInfoFromPlantUML(diagram);
    const valid = await isValidPlantUMLCode(diagram);
    const matches = await compareDiagramObjects(diagramObj, umlObj);

    if (valid && matches) {
      isNotCorrect = false;
      validUMLCode = diagram;
    } else {
      console.log(`Attempt ${attempts}: Diagram did not pass validation.`);
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

module.exports = fileAnalysis;