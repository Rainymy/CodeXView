const path = require("node:path");

const { customWriteStream } = require('../src/utils/fileHandler');
const { analyzeCode } = require('../src/utils/codeParser');

const { validateDiagram, getNextFileName } = require('../src/components/diagramGenerator');
const PlantUML = require("../src/components/PlantUML");

const { getActiveDocumentFile, selectFileDialog } = require('../src/fallbacks/activeDocument');

const { syntaxTreeToJson } = require("../parsers/utils");
const { Notify, parseSetup } = require("./vsUtil");

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

  Notify.info('CodeXView! Processing......');

  const parsedJson = syntaxTreeToJson(analyzeCode(selectedFile));
  const validDiagram = await validateDiagram([parsedJson]);

  if (validDiagram === null) {
    Notify.info("CodeXView! Failed to validate Diagram.");
    return;
  }

  const diagramImage = await PlantUML.requestPlamtUMLImage(validDiagram);

  if (diagramImage === null) {
    Notify.info("CodeXView! Failed to generate Diagram.");
    return;
  }

  const fileName = getNextFileName();
  const error = await customWriteStream(fileName, diagramImage);

  if (error) {
    console.log(`[ ${fileAnalysis.name} ] ${error}`);
    Notify.error("CodeXView! Error adding diagram to project...");
    return;
  }

  Notify.info("CodeXView! Finished, Diagram has been added to your project...");
}

module.exports = fileAnalysis;