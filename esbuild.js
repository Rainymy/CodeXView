const esbuild = require("esbuild");
const path = require("node:path");

const esbuildProblemMatcherPlugin = require("./esbuild_plugins/esbuildProblemMatcher");
const copyStaticAssetsPlugin = require("./esbuild_plugins/copyStaticAssets");
const cleanUpOutputFolder = require("./esbuild_plugins/deleteOutputFolder");

const OUTPUT_FOLDER = "dist";

/**
* @type {import("./esbuild_plugins/copyStaticAssets").StaticCopyConfig}
*/
const StaticAssetsConfig = {
  files: [
    { src: "./language/*.yml", dstFolder: "../" },
    { src: "./commands/panels/*", dstFolder: "../../panels" },
    { src: "./parsers/*/**", dstFolder: "../" },
    { src: "./src/utils/*.txt", dstFolder: "../../" }
  ],
  outDir: OUTPUT_FOLDER
}

async function main() {
  await esbuild.build({
    entryPoints: ["./extension.js"],
    bundle: true,
    format: "cjs",
    minify: true,
    sourcemap: false,
    sourcesContent: false,
    platform: 'node',
    outfile: path.join(OUTPUT_FOLDER, "./extension.js"),
    external: ["vscode", "web-tree-sitter"],
    logLevel: "info",
    plugins: [
      esbuildProblemMatcherPlugin(),
      cleanUpOutputFolder(OUTPUT_FOLDER),
      copyStaticAssetsPlugin(StaticAssetsConfig)
    ]
  });
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
