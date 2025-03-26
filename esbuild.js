const esbuild = require("esbuild");

const fs = require("fs");
const path = require("path");
const fast_glob = require("fast-glob");

const production = process.argv.includes('--production');
const watch = process.argv.includes('--watch');

const OUTPUT_FOLDER = "dist";

/** @type {import('esbuild').Plugin} */
const esbuildProblemMatcherPlugin = {
  name: 'esbuild-problem-matcher',

  setup(build) {
    build.onStart(() => {
      console.log('[watch] build started');
    });
    build.onEnd((result) => {
      for (const { text, location } of result.errors) {
        console.error(`✘ [ERROR] ${text}`);
        console.error(`   ${location.file}:${location.line}:${location.column}:`);
      }
      console.log('[watch] build finished');
    });
  },
};

async function main() {
  const ctx = await esbuild.context({
    entryPoints: [
      './extension.js'
    ],
    bundle: true,
    format: 'cjs',
    minify: production,
    sourcemap: !production,
    sourcesContent: false,
    platform: 'node',
    outfile: path.join(OUTPUT_FOLDER, './extension.js'),
    external: ['vscode', "web-tree-sitter"],
    logLevel: "warning",
    plugins: [
      /* add to the end of plugins array */
      // esbuildProblemMatcherPlugin,
      cleanUpOutputFolder(OUTPUT_FOLDER),
      copyStaticAssetsPlugin({
        files: [
          {
            src: "./language/*.yml",
            dstFolder: "/"
          },
          {
            src: "./parsers/*/**"
          },
          {
            src: "./config.jsonc",
            dstFolder: "/"
          }
        ],
        outDir: OUTPUT_FOLDER
      })
    ],
    loader: {}
  });
  if (watch) {
    await ctx.watch();
  } else {
    await ctx.rebuild();
    await ctx.dispose();
  }
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});

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
        const resolvedTarget = path.resolve(dist);
        const resolvedRoot = path.resolve(__dirname);

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

/**
 * TODO: implement glob for src
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

          const getTargetPath = (file) => {
            return safeJoin(outDir, [
              stat.dstFolder ?? "/",
              isGlobPattern ? file : path.basename(file)
            ]);
          }

          const getSourcePath = (file) => { return safeJoin(__dirname, [file]); }

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
