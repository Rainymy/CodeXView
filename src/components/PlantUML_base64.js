const pako = require("pako");

/**
* @param {Number} c
* @returns
*/
function encode6bit(c) {
  let b = c;
  if (b < 10) return String.fromCharCode(48 + b);    // 0-9
  b -= 10;
  if (b < 26) return String.fromCharCode(65 + b);    // A-Z
  b -= 26;
  if (b < 26) return String.fromCharCode(97 + b);    // a-z
  b -= 26;
  return b === 0 ? '-' : '_';                        // - or _
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
  const c3 = ((b2 & 0xF) << 2) | (b3 >> 6);
  const c4 = b3 & 0x3F;
  return (
    encode6bit(c1 & 0x3F) +
    encode6bit(c2 & 0x3F) +
    encode6bit(c3 & 0x3F) +
    encode6bit(c4 & 0x3F)
  );
}

/**
* @param {String} umlCode
* @returns {String}
*/
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

/**
* @param {String} encodedCode
* @returns {String}
*/
function generateURL(encodedCode) {
  return `https://www.plantuml.com/plantuml/png/${encodedCode}`;
}

module.exports = {
  encoder: encodePlantUML,
  generateURL: generateURL
};