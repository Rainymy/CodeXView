const path = require("node:path");
const fs = require("node:fs");

const { compareDiagramObjects } = require("./diagramChecker");
const { extractNodesInfo } = require("../../parsers/utils");

//const OpenAIConnection = require("./OpenAICompletion");
const AIConnection = require("./AIConnection");
const ProjectConfig = require("./ProjectConfig");
const PlantUML = require("./PlantUML");

/**
* This function has builtin retries.
* @typedef {import("../../parsers/utils").SyntaxTreeJSON} SyntaxTreeJSON
* @param {SyntaxTreeJSON[]} syntaxTree
* @returns {Promise<string|null>}
*/

async function validateDiagram(syntaxTree) {
  const MAX_ATTEMPT = 3;
  let attempts = 0;

  const diagramObj = extractNodesInfo(syntaxTree);

  while (attempts < MAX_ATTEMPT) {
    attempts++;
  
    //connection to o1 Model
    //const diagram = await AIConnection.getChatResponse(allSyntaxTreeJSON);
    const diagram = await AIConnection.getChatResponse(syntaxTree);
    // console.log("workspace diagram:", diagram);

    const IsValidDiagramCode = await PlantUML.validatePlantUML(diagram);
    if (IsValidDiagramCode) {
      return diagram;
    }
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