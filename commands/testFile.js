const path = require("node:path");

const { readPrompt, customWriteStream } = require("../src/utils/fileHandler");
const { analyzeCode } = require("../src/utils/codeParser");

const {
	validateDiagram,
	getNextFileName,
} = require("../src/components/diagramGenerator");
const PlantUML = require("../src/components/PlantUML");
const AIConnection = require("../src/components/AIConnection");

const {
	getActiveDocumentFile,
	selectFileDialog,
} = require("../src/fallbacks/activeDocument");

const { syntaxTreeToJson, extractNodeInfo } = require("../parsers/utils");
const { Notify, parseSetup } = require("./vsUtil");

async function diagramTesting() {
  const selectedFile =
    getActiveDocumentFile() ?? (await selectFileDialog());

  if (!selectedFile) {
    Notify.error("No active document found / No file selected.");
    return;
  }

  Notify.info("CodeXView! Found File...");

  if (!parseSetup(path.dirname(selectedFile))) {
    Notify.error("⚠️ Problem with permission!");
    return;
  }

  let failCount = 0;

  for (let i = 1; i <= 100; i++) {
    Notify.info(`CodeXView! Run #${i} processing…`);

    // Re-parse/convert on each run
    const parsedCode = analyzeCode(selectedFile);
    const parsedJson = syntaxTreeToJson(parsedCode);
    const diagramObj = extractNodeInfo(parsedJson);

    // 1) Validate the diagram
    let validDiagram;
    try {
      validDiagram = await validateDiagram(diagramObj, parsedJson);
    } catch (err) {
      failCount++;
      console.error(`[diagramTesting] Run ${i} — validation threw: ${err.message}`);
      continue;
    }
    if (validDiagram === null) {
      failCount++;
      console.error(`[diagramTesting] Run ${i} — validation returned null`);
      continue;
    }

    // 2) Generate the image
    let diagramImage;
    try {
      diagramImage = await PlantUML.requestPlamtUMLImage(validDiagram);
    } catch (err) {
      failCount++;
      console.error(`[diagramTesting] Run ${i} — image request threw: ${err.message}`);
      continue;
    }
    if (diagramImage === null) {
      failCount++;
      console.error(`[diagramTesting] Run ${i} — image generation returned null`);
      continue;
    }

    // 3) Write the file
    try {
      const fileName = getNextFileName();
      const error = await customWriteStream(fileName, diagramImage);
      if (error) {
        throw error;
      }
    } catch (err) {
      failCount++;
      console.error(`[diagramTesting] Run ${i} — write error: ${err.message}`);
      continue;
    }

    // Success
    Notify.info(`CodeXView! Run #${i} succeeded.`);
  }

  console.log(`diagramTesting complete: ${failCount} failures out of 100 runs.`);
}

module.exports = diagramTesting;
