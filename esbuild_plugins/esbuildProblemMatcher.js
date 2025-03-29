/**
*
* @returns {import("esbuild").Plugin}
*/
function esbuildProblemMatcherPlugin() {
  return {
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
}

module.exports = esbuildProblemMatcherPlugin;