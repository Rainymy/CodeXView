const path = require("path");
const fs = require("fs");

const { printFancyTitle } = require("./util");

const BINARY_ENTRY = "entry.js";
const ROOT_PARSER = __dirname;


/**
* Retreive files recursively.
* - ONLY handles DIRECTORY and FILE.
* - filters file by entry filename from `providor.js`
* @return {String[]}
*/
function parseFolder() {
  printFancyTitle(" Getting Loaders Ready ");
  const item = [ROOT_PARSER];
  const files = [];

  // recursively read folder.
  while (item.length) {
    const element = item.pop();
    const stat = fs.lstatSync(element);

    if (stat.isDirectory()) {
      item.unshift(
        ...fs.readdirSync(element).map(v => path.join(element, v))
      );
    }
    if (stat.isFile()) { files.push({ stat: stat, pathFs: element }); }
  }

  // filter by filename (ex. index.js);
  const entryFiles = files.filter((file) => {
    const filename = path.basename(file.pathFs);
    return filename.toLowerCase() === BINARY_ENTRY.toLowerCase();
  });

  return entryFiles.map((v) => v.pathFs);
}

module.exports = {
  parseFolder: parseFolder,
}