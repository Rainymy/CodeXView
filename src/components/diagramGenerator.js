const path = require("node:path");
const fs = require("node:fs");

const AIConnection = require("./OpenAICompletion");
//const AIConnection = require("./AIConnection");
const ProjectConfig = require("./ProjectConfig");
const PlantUML = require("./PlantUML");


async function validateDiagram(summaryJson) {
  const MAX_ATTEMPT = 3;
  let attempts = 0;

  while (attempts < MAX_ATTEMPT) {
    attempts++;
  
    const diagram = await AIConnection.getChatResponse(summaryJson);
    console.log("Diagram: ", diagram);

    const IsValidDiagramCode = await PlantUML.validatePlantUML(diagram);
    const relationPattern = /(-->|<--|<->|--|==|\.{1,2}>|<\.{1,2})/;
    const hasRelation = relationPattern.test(diagram);

    if (IsValidDiagramCode && hasRelation) {
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