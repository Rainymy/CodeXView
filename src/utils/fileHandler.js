const fs = require("node:fs");
const path = require('node:path');

/**
* @param {String} filePathFs
* @param {BufferEncoding=} encoding
* @returns
*/
function readFileSync(filePathFs, encoding) {
  return fs.readFileSync(filePathFs, encoding);
}

/**
* @param {String} filePathFs
* @returns
*/
function existsSync(filePathFs) {
  return fs.existsSync(filePathFs);
}

/**
* @param {String} filePath
* @returns
*/
function readdirSync(filePath) {
  return fs.readdirSync(filePath);
}

/**
* @param {String} filePath
* @returns {Promise<Error|string[]>}
*/
function readdir(filePath) {
  return new Promise((resolve, reject) => {
    fs.readdir(filePath, { recursive: true }, (error, data) => {
      if (error) {
        return reject(error);
      }
      resolve(data.map(toString));
    })
  });
}

/**
* @param {String} folderPathFs
* @returns {boolean}
* returns true if operation is success. Else return false.
*/
function ensureFolderSync(folderPathFs) {
  try {
    if (!fs.existsSync(folderPathFs)) {
      fs.mkdirSync(folderPathFs, { recursive: true });
    }
    return true;
  }
  catch {
    return false;
  }
}

/**
* @param {String} filePathFs
* @param {object} data
* @returns
*/
function customWriteJSONFileSync(filePathFs, data) {
  // pretty stringify JSON
  return fs.writeFileSync(filePathFs, JSON.stringify(data, null, 4));
}

/**
* @param {String} filePathFs
* @param {Object} data
* @returns
*/
function customWriteFileSync(filePathFs, data) {
  return fs.writeFileSync(filePathFs, JSON.stringify(data));
}

/**
* @param {String} filePath
* @returns {Promise<Error|string>}
*/
function deleteFile(filePath) {
  return new Promise((resolve) => {
    fs.unlink(filePath, (err) => resolve(err ?? null));
  });
}

/**
* @param {String} filePathFs
* @returns {Promise<Error|string>}
*/
function customReadStream(filePathFs) {
  return new Promise((resolve) => {
    let data = "";
    const readStream = fs.createReadStream(filePathFs, { flags: "r" });
    readStream.on("data", (chunks) => { data += chunks.toString(); });
    readStream.on("end", () => resolve(data));
    readStream.on("error", () => resolve(null));
  });
}

/**
* @param {String} filePathFs
* @param {Object} data
* @returns {Promise<Error|null>}
*/
function customWriteStream(filePathFs, data) {
  return new Promise((resolve) => {
    const stream = fs.createWriteStream(filePathFs, { flags: "w+" });
    stream.on("ready", () => {
      stream.write(data);
      stream.end();
    });

    stream.on("finish", () => resolve(null));
    stream.on("error", (err) => resolve(err));
  });
}

function readCCDExample() {
  const ccd_example_txt = path.join(__dirname, "ccd-example.txt");
  return fs.readFileSync(ccd_example_txt, "utf8");
}

function readPrompt() {
  const prompt = path.join(__dirname, "prompt.txt");
  return fs.readFileSync(prompt, "utf8");
}

module.exports = {
  readFileSync: readFileSync,
  existsSync: existsSync,
  readdir: readdir,
  readdirSync: readdirSync,
  ensureFolderSync: ensureFolderSync,
  writeJSONFileSync: customWriteJSONFileSync,
  writeFileSync: customWriteFileSync,
  deleteFile: deleteFile,
  customReadStream: customReadStream,
  customWriteStream: customWriteStream,
  readCCDExample: readCCDExample,
  readPrompt: readPrompt
}