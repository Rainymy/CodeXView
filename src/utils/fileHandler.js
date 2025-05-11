const fs = require("node:fs");
const path = require('node:path');

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
* @returns {Promise<Error|Buffer>}
*/
function customReadStream(filePathFs) {
  return new Promise((resolve) => {
    /** @type {Buffer[]} */ const data = [];
    const readStream = fs.createReadStream(filePathFs, { flags: "r" });
    readStream.on("data", (chunks) => { data.push(Buffer.from(chunks)) });
    readStream.on("end", () => resolve(Buffer.concat(data)));
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
  const ccd_example_txt = path.join(__dirname, "../prompts/ccd-example.txt");
  return fs.readFileSync(ccd_example_txt, "utf8");
}

function readPrompt() {
  const prompt = path.join(__dirname, "../prompts/prompt.txt");
  return fs.readFileSync(prompt, "utf8");
}

module.exports = {
  readdir: readdir,
  ensureFolderSync: ensureFolderSync,
  deleteFile: deleteFile,
  customReadStream: customReadStream,
  customWriteStream: customWriteStream,
  readCCDExample: readCCDExample,
  readPrompt: readPrompt
}