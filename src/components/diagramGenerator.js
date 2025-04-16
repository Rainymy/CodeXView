const path = require("node:path");

const AIConnection = require("./AIConnection");
const { compareDiagramObjects } = require("./diagramChecker");

const { readdirSync } = require("../utils/fileHandler");

const ProjectConfig = require("./ProjectConfig");
const PlantUML = require("./PlantUML");

/**
* This function has builtin retries.
* @typedef {import("../../parsers/utils").SyntaxTreeJSON} SyntaxTreeJSON
* @param {import("../../parsers/utils").DiagramObjects} diagramObj
* @param {SyntaxTreeJSON|SyntaxTreeJSON[]} allSyntaxTreeJSON
*/
async function validateAndGetPlantUML(diagramObj, allSyntaxTreeJSON, cb) {
  let attempts = 1;
  const maxAttempts = 5;

  while (attempts <= maxAttempts) {
    attempts++;

    const diagram = await AIConnection.getChatResponse(allSyntaxTreeJSON);
    console.log("workspace diagram:", diagram);

    const umlObj = PlantUML.extractClassName(diagram);

    console.log("umlObj:", umlObj);
    const plantUML = await requestPlamtUMLCode(diagram);
    const matches = compareDiagramObjects(diagramObj, umlObj);

    if (!plantUML || !matches) {
      console.log(`Attempt ${attempts}: Diagram did not pass validation.`);
      console.log("Valid:", plantUML);
      console.log("Matches:", matches);
      console.log("Diagram:", umlObj.classCounter);
      console.log("Parsed:", diagramObj.classCounter);
    }

    return plantUML;
  }

  return null;
}

function getNextFileName() {
  const outputFolder = ProjectConfig.getOutputFolder();
  const projectName = path.basename(ProjectConfig.getRootFolder());

  const pngFiles = readdirSync(outputFolder)
    .filter((file) => file.endsWith(".png"));

  return pngFiles.length > 0
    ? path.join(
      outputFolder,
      `${projectName}_CCD_Diagram_v${pngFiles.length + 1}.png`,
    )
    : path.join(outputFolder, `${projectName}_CCD_Diagram.png`);
}

/**
 * @param {String} diagramCode
 * @returns {Promise<Buffer|null>}
 */
async function requestPlamtUMLCode(diagramCode) {
  const cleanedOutput = diagramCode
    .replace(/^```plantuml\s*/i, "")
    .replace(/\s*```$/, "");

  const plantumlUrl = PlantUML.generateURL(PlantUML.encoder(cleanedOutput));

  try {
    const response = await fetch(plantumlUrl, { method: "GET" });

    // If the server couldn't generate a diagram, it returns a 4xx or 5xx
    if (!response.ok) {
      console.error(
        `[ ${requestPlamtUMLCode.name} ] Response not OK: ${response.statusText}`,
      );
      return null;
    }

    return Buffer.from(await response.arrayBuffer());
  } catch (error) {
    console.error(`[ ${requestPlamtUMLCode.name} ] Network error: ${error}`);
    return null;
  }
}

module.exports = {
  validateAndGetPlantUML: validateAndGetPlantUML,
  getNextFileName: getNextFileName,
  requestPlamtUMLCode: requestPlamtUMLCode
}