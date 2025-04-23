const zlib = require("node:zlib");

const { createDiagramObject } = require("../../parsers/utils");

/**
 * @param {Number} c
 * @returns
 */
function encode6bit(c) {
  let b = c;
  if (b < 10) return String.fromCharCode(48 + b); // 0-9
  b -= 10;
  if (b < 26) return String.fromCharCode(65 + b); // A-Z
  b -= 26;
  if (b < 26) return String.fromCharCode(97 + b); // a-z
  b -= 26;
  return b === 0 ? "-" : "_"; // - or _
}

/**
 * @param {Number} b1
 * @param {Number} b2
 * @param {Number} b3
 * @returns
 */
function append3bytes(b1, b2, b3) {
  const c1 = b1 >> 2;
  const c2 = ((b1 & 0x3) << 4) | (b2 >> 4);
  const c3 = ((b2 & 0xf) << 2) | (b3 >> 6);
  const c4 = b3 & 0x3f;
  return (
    encode6bit(c1 & 0x3f) +
    encode6bit(c2 & 0x3f) +
    encode6bit(c3 & 0x3f) +
    encode6bit(c4 & 0x3f)
  );
}

/**
 * @param {String} umlCode
 * @returns {String}
 */
function encodePlantUML(umlCode) {
  const buffer = Buffer.from(umlCode, "utf-8");
  const compressed = Uint8Array.from(zlib.deflateRawSync(buffer));

  // PlantUML uses custom Base64.
  let encoded = "";
  for (let i = 0; i < compressed.length; i += 3) {
    if (i + 2 === compressed.length) {
      // Only 2 bytes left
      encoded += append3bytes(compressed[i], compressed[i + 1], 0);
    } else if (i + 1 === compressed.length) {
      // Only 1 byte left
      encoded += append3bytes(compressed[i], 0, 0);
    } else {
      // 3 bytes
      encoded += append3bytes(
        compressed[i],
        compressed[i + 1],
        compressed[i + 2],
      );
    }
  }
  return encoded;
}

/**
 * @param {String} encodedCode
 * @returns {String}
 */
function generateURL(encodedCode) {
  return `https://www.plantuml.com/plantuml/png/${encodedCode}`;
}

/**
 * @param {String} umlString
 * @returns
 */
function extractClassName(umlString) {
  const classRegex = /^\s*(?:abstract\s+)?class\s+(\w+)/gm;
  const classNames = [];

  let match = classRegex.exec(umlString);

  while (match !== null) {
    classNames.push(match[1]);
    match = classRegex.exec(umlString);
  }

  return createDiagramObject(classNames);
}

/**
 * @param {String} diagramCode   PlantUML source (may be fenced in ```plantuml…```)
 * @returns {Promise<boolean>}   true if valid UML, false if syntax/server error
 */
async function validatePlantUML(diagramCode) {
  // 1) strip Markdown fences
  const cleaned = diagramCode
    .replace(/^```plantuml\s*/i, "")
    .replace(/\s*```$/, "");

  // 2) encode just like your image request
  const encoded = encodePlantUML(cleaned);

  // 3) build the URL and switch the 'png' endpoint to 'txt'
  const imageUrl      = generateURL(encoded);
  const validationUrl = imageUrl.replace(/\/png\//, "/txt/");

  try {
    const res = await fetch(validationUrl, { method: "GET" });

    // non‑2xx → PlantUML definitely hit an error
    if (!res.ok) {
      console.error(
        `[validatePlantUML] server returned ${res.status} ${res.statusText}`
      );
      return false;
    }

    // 4) read the text response; PlantUML puts errors right into the body
    const body = await res.text();
    if (/error/i.test(body)) {
      console.error(`[validatePlantUML] syntax error:\n${body}`);
      return false;
    }

    return true;
  } catch (e) {
    console.error("[validatePlantUML] network or unexpected error:", e);
    return false;
  }
}



/**
 * @param {String} diagramCode
 * @returns {Promise<Buffer|null>}
 */
async function requestPlamtUMLImage(diagramCode) {
  const cleanedOutput = diagramCode
    .replace(/^```plantuml\s*/i, "")
    .replace(/\s*```$/, "");

  const plantumlUrl = generateURL(encodePlantUML(cleanedOutput));

  try {
    const response = await fetch(plantumlUrl, { method: "GET" });

    // If the server couldn't generate a diagram, it returns a 4xx or 5xx
    if (!response.ok) {
      console.error(
        `[ ${requestPlamtUMLImage.name} ] Response not OK: ${response.statusText}`,
      );
      return null;
    }

    return Buffer.from(await response.arrayBuffer());
  } catch (error) {
    console.error(`[ ${requestPlamtUMLImage.name} ] Network error: ${error}`);
    return null;
  }
}

module.exports = {
  extractClassName: extractClassName,
  requestPlamtUMLImage: requestPlamtUMLImage,
  validatePlantUML: validatePlantUML
};
