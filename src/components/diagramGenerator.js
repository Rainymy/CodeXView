const { customWriteStream } = require("../utils/fileHandler");

const fs = require('fs');
const path = require('path');
const axios = require("axios");

const ProjectConfig = require("./ProjectConfig");
const PlantUML = require("./PlantUML_base64");

async function generateCCDiagram(folderPath, projectName) {

  const exampleccdDiagram = `
    @startuml
    Bob -> Alice : hellorequest
    @enduml
    `;

  const plantumlUrl = PlantUML.generateURL(PlantUML.encoder(exampleccdDiagram))
  // console.log(`Fetching diagram from: ${plantumlUrl}`);

  try {
    // Fetch the PNG from PlantUML
    const response = await axios.get(plantumlUrl);
    const fileName = getNextFileName(projectName);

    customWriteStream(fileName, response.data);

  } catch (error) {
    console.error(`Error generating CCD diagram: ${error.message}`);
    return false;
  }

  return true;
}


function getNextFileName(projectName) {
  const outputFolder = ProjectConfig.getOutputFolder();
  const pngFiles = fs.readdirSync(outputFolder).filter(file => file.endsWith(".png"));

  return (pngFiles.length > 0)
    ? path.join(outputFolder, `${projectName}_CCD_Diagram_v${pngFiles.length + 1}.png`)
    : path.join(outputFolder, `${projectName}_CCD_Diagram.png`);
}


module.exports = { generateCCDDiagram: generateCCDiagram };
