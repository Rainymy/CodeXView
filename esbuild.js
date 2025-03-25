const esbuild = require("esbuild");

const production = process.argv.includes('--production');
const watch = process.argv.includes('--watch');

/**
 * @type {import('esbuild').Plugin}
 */
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
    outfile: 'dist/extension.js',
    external: ['vscode'],
    logLevel: "warning",
    plugins: [
      /* add to the end of plugins array */
      esbuildProblemMatcherPlugin,
    ],
    loader: {
      ".yml": "text"
    }
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
          const fileName = path.basename(stat.src);

          const targetFile = safeJoin(outDir, [stat.dstFolder ?? "/", fileName]);
          const sourceFile = safeJoin(__dirname, [stat.src]);

          if (!fs.existsSync(sourceFile)) {
            console.warn(`⚠️  Skipped missing file: ${sourceFile}`);
            continue;
          }

          fs.mkdirSync(path.dirname(targetFile), { recursive: true });
          fs.copyFileSync(sourceFile, targetFile);

          console.log(`📄 Copied asset: ${stat.src} → ${targetFile}`);
        }
      });
    }
  };
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
