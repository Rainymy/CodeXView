const path = require("node:path");
const fs = require("node:fs");

const OpenAIConnection = require("./OpenAICompletion");
const { compareDiagramObjects } = require("./diagramChecker");

const ProjectConfig = require("./ProjectConfig");
const PlantUML = require("./PlantUML");

/**
* This function has builtin retries.
* @typedef {import("../../parsers/utils").SyntaxTreeJSON} SyntaxTreeJSON
* @param {import("../../parsers/utils").DiagramObjects} diagramObj
* @param {SyntaxTreeJSON[]} syntaxTree
* @returns {Promise<string|null>}
*/
async function validateDiagram(diagramObj, syntaxTree) {
  const MAX_ATTEMPT = 1;
  let attempts = 0;

  while (attempts < MAX_ATTEMPT) {
    attempts++;

    const diagram = await OpenAIConnection.getChatResponse(syntaxTree);
    // console.log("workspace diagram:", diagram);

    // extraction and compare is not working togethor
    // both works differently
    const umlObj = PlantUML.extractClassName(diagram);
    if (compareDiagramObjects(diagramObj, umlObj)) {
      return diagram;
    }

    console.log(`Attempt ${attempts}: Diagram did not pass validation.`);
    console.log("Diagram:", umlObj.classNames);
    console.log("Parsed:", diagramObj.classNames);
  }

  return null;
}

function getNextFileName() {
  const outputFolder = ProjectConfig.getOutputFolder();
  const projectName = path.basename(ProjectConfig.getRootFolder());

  const pngFiles = fs.readdirSync(outputFolder)
    .filter((file) => file.endsWith(".png"));

  return pngFiles.length > 0
    ? path.join(
      outputFolder,
      `${projectName}_CCD_Diagram_v${pngFiles.length + 1}.png`,
    )
    : path.join(outputFolder, `${projectName}_CCD_Diagram.png`);
}

module.exports = {
  validateDiagram: validateDiagram,
  getNextFileName: getNextFileName
}