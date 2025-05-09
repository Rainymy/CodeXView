const path = require("node:path");
const fs = require("node:fs");

const AIConnection = require("./OpenAICompletion");
//const AIConnection = require("./AIConnection");
const ProjectConfig = require("./ProjectConfig");
const PlantUML = require("./PlantUML");


async function validateDiagram(summaryJson) {
  const MAX_ATTEMPT = 3;
  let attempts = 0;

  let feedback = null;

  while (attempts < MAX_ATTEMPT) {
    attempts++;

    const diagram = await AIConnection.getChatResponse(summaryJson, feedback);
    console.log(`Attempt ${attempts} - Diagram:\n`, diagram);

    const isValid = await PlantUML.validatePlantUML(diagram);
    const relationPattern = /(-->|<--|<->|--|==|\.{1,2}>|<\.{1,2})/;
    const hasRelation = relationPattern.test(diagram);

    if (isValid && hasRelation) {
      return diagram;
    }

    // Build feedback to improve the next attempt
    if (!hasRelation) {
      feedback = "The diagram is missing relationships (arrows) between classes based on the message data. Please include them.";
    } else if (!isValid) {
      feedback = "The PlantUML diagram is not valid. Please fix the syntax.";
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