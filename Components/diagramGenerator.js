const fs = require('fs');
const path = require('path');
const axios = require("axios");
const pako = require("pako");

async function generateCCDDiagram(ccdDiagramCode, folderPath, projectName) {
    try {
      const outputFolder = path.join(folderPath, "CodeXView");
  
      if (!fs.existsSync(outputFolder)) {
        fs.mkdirSync(outputFolder, { recursive: true });
        console.log(`Created folder: ${outputFolder}`);
      }
  
      const pngFiles = fs.readdirSync(outputFolder).filter(file => file.endsWith(".png"));
      const outputFilePath = (pngFiles.length > 0)
        ? path.join(outputFolder, `${projectName}_CCD_Diagram_v${pngFiles.length + 1}.png`)
        : path.join(outputFolder, `${projectName}_CCD_Diagram.png`);
  
      const encodedCode = encodePlantUML(exampleccdDiagram);
  
      const plantumlUrl = `https://www.plantuml.com/plantuml/png/${encodedCode}`;
      console.log(`Fetching diagram from: ${plantumlUrl}`);
  
      // Fetch the PNG from PlantUML
      const response = await axios.get(plantumlUrl, { responseType: "arraybuffer" });
      fs.writeFileSync(outputFilePath, response.data);
  
      console.log(`CCD Diagram saved at: ${outputFilePath}`);
      return true;
    } catch (error) {
      console.error(`Error generating CCD diagram: ${error.message}`);
      return false;
    }
  }
  
  const exampleccdDiagram = `
  @startuml
  Bob -> Alice : hellorequest
  @enduml
  `;


function encode6bit(b) {
    if (b < 10) return String.fromCharCode(48 + b);    // 0-9
    b -= 10;
    if (b < 26) return String.fromCharCode(65 + b);    // A-Z
    b -= 26;
    if (b < 26) return String.fromCharCode(97 + b);    // a-z
    b -= 26;
    return b === 0 ? '-' : '_';                        // - or _
  }
  
  function append3bytes(b1, b2, b3) {
    const c1 = b1 >> 2;
    const c2 = ((b1 & 0x3) << 4) | (b2 >> 4);
    const c3 = ((b2 & 0xF) << 2) | (b3 >> 6);
    const c4 = b3 & 0x3F;
    return (
      encode6bit(c1 & 0x3F) +
      encode6bit(c2 & 0x3F) +
      encode6bit(c3 & 0x3F) +
      encode6bit(c4 & 0x3F)
    );
  }
  
  function encodePlantUML(umlCode) {
    // 1) UTF-8 bytes
    const utf8 = Buffer.from(umlCode, 'utf-8');
  
    // 2) Deflate (no zlib headers)
    const compressed = pako.deflateRaw(utf8);
  
    // 3) Custom Base64
    let encoded = '';
    for (let i = 0; i < compressed.length; i += 3) {
      if (i + 2 === compressed.length) {
        // Only 2 bytes left
        encoded += append3bytes(compressed[i], compressed[i + 1], 0);
      } else if (i + 1 === compressed.length) {
        // Only 1 byte left
        encoded += append3bytes(compressed[i], 0, 0);
      } else {
        // 3 bytes
        encoded += append3bytes(compressed[i], compressed[i + 1], compressed[i + 2]);
      }
    }
    return encoded;
  }


module.exports = { generateCCDDiagram };