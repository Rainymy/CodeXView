const path = require("path");

const { printFancyTitle } = require("./util");

const platform = process.platform;
const architecture = process.arch;
const systen_build = `${platform}-${architecture}`;

printFancyTitle(` Platform: ${platform}, Arch: ${architecture} `);

module.exports = {
  platform: platform,
  arch: architecture,
  pathToBinary: path.join(__dirname, "../prebuilds", systen_build),
  binaryEntries: "entry.js"
}