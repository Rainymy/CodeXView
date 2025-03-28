const fs = require("fs");
const path = require("path");

const fast_glob = require("fast-glob");
const pathRightJoin = require("path-right-join");

const { makeHardCopy, safeJoin } = require("./utils");


/**
* @typedef {Object} AssetFile
* @property {String} AssetFile.src
* @property {String=} AssetFile.dstFolder
*
* @typedef {object} StaticCopyConfig
* @property {AssetFile[]} files
* @property {String} outDir
*/

const DEFAULT_OUTPUT_FOLDER = "/";

/**
 * Esbuild plugin to copy target files accessed via fs.readFileSync
 * @param {StaticCopyConfig} options
 * @returns {import('esbuild').Plugin}
 */
function copyStaticAssetsPlugin({ files = [], outDir }) {
  return {
    name: "copy-static-assets",
    setup(build) {
      build.onEnd(() => {
        for (const stat of files) {
          const isGlobPattern = fast_glob.isDynamicPattern(stat.src);
          const workingDirectory = path.join(__dirname, "..");

          const getTargetPath = (file) => {
            const rightJoined = pathRightJoin(
              stat.dstFolder ?? DEFAULT_OUTPUT_FOLDER,
              isGlobPattern ? DEFAULT_OUTPUT_FOLDER + file : path.basename(file)
            );
            return safeJoin(outDir, [rightJoined]);
          }

          const getSourcePath = (file) => {
            return safeJoin(workingDirectory, [file]);
          }

          const sources = isGlobPattern
            ? fast_glob.globSync(stat.src, { dot: true, extglob: true })
            : [stat.src];

          for (const src of sources) {
            const sourcePath = getSourcePath(src);
            const targetPath = getTargetPath(src);

            if (!fs.existsSync(sourcePath)) {
              console.warn(`⚠️  Skipped missing file: ${src}`);
              return;
            }
            if (fs.existsSync(targetPath)) {
              console.warn(`❌  Overwrite detected: ${targetPath}`);
              return;
            }

            if (!makeHardCopy(sourcePath, targetPath)) {
              console.log(`📄 Asset failed: ${src} → ${targetPath}`);
              continue;
            }

            console.log(`📄 Copied asset: ${src} → ${targetPath}`);
          }
        }
      });
    }
  };
}

module.exports = copyStaticAssetsPlugin;