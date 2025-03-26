const esbuild = require("esbuild");
const path = require("path");

const esbuildProblemMatcherPlugin = require("./esbuild_plugins/esbuildProblemMatcher");
const copyStaticAssetsPlugin = require("./esbuild_plugins/copyStaticAssets");
const cleanUpOutputFolder = require("./esbuild_plugins/deleteOutputFolder");

const production = process.argv.includes('--production');
const watch = process.argv.includes('--watch');

const OUTPUT_FOLDER = "dist";

const StaticAssetsConfig = {
  files: [
    {
      src: "./language/*.yml",
      dstFolder: "/"
    },
    {
      src: "./parsers/*/**",
      dstFolder: "../"
    },
    {
      src: "./config.jsonc",
      dstFolder: "/"
    }
  ],
  outDir: OUTPUT_FOLDER
}

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
      esbuildProblemMatcherPlugin(),
      cleanUpOutputFolder(OUTPUT_FOLDER),
      copyStaticAssetsPlugin(StaticAssetsConfig)
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
