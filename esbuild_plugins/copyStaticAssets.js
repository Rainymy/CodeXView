const fs = require("fs");
const path = require("path");
const fast_glob = require("fast-glob");

const { makeHardCopy, safeJoin } = require("./utils");

/**
 * Esbuild plugin to copy target files accessed via fs.readFileSync
 * @param {{ files: {src: string, dstFolder?: string}[], outDir: string }} options
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

            const temp = pathRightJoin(
              stat.dstFolder ?? "/",
              isGlobPattern ? "/" + file : path.basename(file)
            );

            return safeJoin(outDir, [
              stat.dstFolder ?? "/",
              isGlobPattern ? file : path.basename(file)
            ]);
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

/**
* Right-side join for paths, ignoring ".." from left segments.
* @param  {string[]} segmantation Any number of path segments.
* @returns {string} - Normalized, right-joined path.
*/
function pathRightJoin(...segmantation) {
  const pathString = path.normalize(segmantation.map(path.normalize).join(""));
  const segments = pathString.split(path.sep);
  const result = [];

  for (let i = 0; i < segments.length - 1; i++) {
    const segment = segments[i];
    // Skip ".." and the next segment.
    if (segment === "..") {
      i++;
      continue;
    }

    result.push(segment);
  }

  return path.join(...result);
}

module.exports = copyStaticAssetsPlugin;