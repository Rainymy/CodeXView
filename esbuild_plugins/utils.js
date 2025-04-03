const fs = require("node:fs");
const path = require("node:path");

/**
* @param {String} sourceFile
* @param {String} targetFile
* @returns {Boolean}
*/
function makeHardCopy(sourceFile, targetFile) {
  try {
    fs.mkdirSync(path.dirname(targetFile), { recursive: true });
    fs.copyFileSync(sourceFile, targetFile);
    return true;
  }
  catch {
    return false;
  }
}

/**
 * Securely joins a path, making sure it doesn't escape the base directory
 * @param {string} base - The base directory (e.g., /dist)
 * @param {string[]?} segments - Path segments to join
 * @returns {string} A safe path within the base
 */
function safeJoin(base, segments = []) {
  const toPath = path.join(base, ...segments);

  const root = path.normalize(base);
  const targetPath = path.normalize(toPath);

  // Ensure the final path starts with the base path
  if (!targetPath.startsWith(root)) {
    return path.join(root, targetPath === path.sep ? "" : targetPath);
  }
  return targetPath;
}

module.exports = {
  makeHardCopy: makeHardCopy,
  safeJoin: safeJoin
}
