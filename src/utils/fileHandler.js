"use strict";
const fs = require('fs');

/**
* @param {String} filePathFs
* @returns {object}
*/
function readJSONFileSync(filePathFs) {
  const data = fs.readFileSync(filePathFs, { encoding: "utf8" });
  return JSON.parse(data);
}

/**
* @param {String} filePath
* @returns
*/
function readdirSync(filePath) {
  return fs.readdirSync(filePath);
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
* @returns
*/
function deleteFile(filePath) {
  return new Promise((resolve, reject) => fs.unlink(filePath, resolve));
}

/**
* @param {String} filePathFs
* @returns
*/
function customReadStream(filePathFs) {
  return new Promise((resolve, reject) => {
    let data = "";
    const readStream = fs.createReadStream(filePathFs, { flags: "r" });
    readStream.on("data", (chunks) => { data += chunks; });
    readStream.on("end", () => resolve(data));
    readStream.on("error", (error) => resolve(null));
  });
}

/**
* @param {String} filePathFs
* @param {Object} data
* @returns
*/
function customWriteStream(filePathFs, data) {
  return new Promise((resolve, reject) => {
    const stream = fs.createWriteStream(filePathFs, { flags: "w+" });
    stream.on("ready", () => {
      stream.write(JSON.stringify(data, null, 4));
      stream.end();
    });

    stream.on("finish", () => resolve(null));
    stream.on("error", resolve);
  });
}

module.exports = {
  readJSONFileSync: readJSONFileSync,
  readdirSync: readdirSync,
  writeJSONFileSync: customWriteJSONFileSync,
  writeFileSync: customWriteFileSync,
  deleteFile: deleteFile,
  customReadStream: customReadStream,
  customWriteStream: customWriteStream
}