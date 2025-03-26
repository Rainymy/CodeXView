const fs = require("fs");
const path = require("path");

/**
 * Esbuild plugin delete output folder.
 * @param {String} dist - **MUST PROVIDE OUTPUT FOLDER**
 * @returns {import('esbuild').Plugin}
 */
function cleanUpOutputFolder(dist) {
  return {
    name: "delete-output-folder",
    setup(build) {
      build.onStart(() => {
        const workingDirectory = path.join(__dirname, "..");

        const resolvedTarget = path.resolve(dist);
        const resolvedRoot = path.resolve(workingDirectory);

        // Safety check: ensure the folder is within the project root
        if (!resolvedTarget.startsWith(resolvedRoot + path.sep)) {
          throw new Error(
            [
              "❌ Refusing to delete outside project root!",
              `  ⮡  Root  : ${resolvedRoot}`,
              `  ⮡  Target: ${resolvedTarget}`
            ].join("\n")
          );
        }

        if (!fs.existsSync(dist)) {
          return;
        }

        if (!fs.lstatSync(dist).isDirectory()) {
          throw new Error(`❌ Not a valid output directory: ${resolvedTarget}`);
        }

        fs.rmSync(dist, { recursive: true });
      })
    }
  }
}

module.exports = cleanUpOutputFolder;