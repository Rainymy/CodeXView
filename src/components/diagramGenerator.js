const path = require('node:path');

const { customWriteStream, readdirSync } = require("../utils/fileHandler");

const ProjectConfig = require("./ProjectConfig");
const PlantUML = require("./PlantUML_base64");

async function generateCCDiagram(diagramCode) {
  const cleanedOutput = diagramCode.replace(/^```plantuml\s*/i, '').replace(/\s*```$/, '');

  const plantumlUrl = PlantUML.generateURL(PlantUML.encoder(cleanedOutput))

  let data;
  try {
    // Fetch the PNG from PlantUML
    const response = await fetch(plantumlUrl, { method: "GET" });

    if (!response.ok) {
      return false;
    }

    data = Buffer.from(await response.arrayBuffer());
  } catch (error) {
    console.error(`Network error : ${error.message}`);
    return false;
  }

  // write PNG to file
  const fileName = getNextFileName();
  const error = await customWriteStream(fileName, data);

  if (error) {
    console.error(`Error generating CCD diagram: ${error.message}`);
    return false;
  }

  return true;
}

function getNextFileName() {
  const outputFolder = ProjectConfig.getOutputFolder();
  const projectName = path.basename(ProjectConfig.getRootFolder());

  const pngFiles = readdirSync(outputFolder).filter(file => file.endsWith(".png"));

  return (pngFiles.length > 0)
    ? path.join(outputFolder, `${projectName}_CCD_Diagram_v${pngFiles.length + 1}.png`)
    : path.join(outputFolder, `${projectName}_CCD_Diagram.png`);
}

module.exports = { generateCCDiagram: generateCCDiagram };
