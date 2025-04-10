const path = require("node:path");

const { Parser, Language } = require("web-tree-sitter");
const pico = require("picocolors");

const { loadEntry } = require("./utils");
const { measureTime } = require("./perf_utils");
const { printFancyTitle } = require("../src/utils/fancyTitle");

/** @type {import('./language').Entries} */
const entries = require("./entries.json");

/** @type {Parser} */
let parser = null;
const lang_parsers = new Map();

async function load_parsers() {
  printFancyTitle("Getting Loaders Ready");

  await Parser.init();
  parser = new Parser();
  let duplicates = 0;

  // Make sure there are something to process.
  if (entries.length === 0) {
    console.error(pico.red(" - No Entries Found!"));
  }

  for (const entry of entries) {
    // check for duplicate entries.
    if (lang_parsers.has(entry.name)) {
      console.error(
        pico.yellow(` - Duplicate Entry:\n\t${entry.name} ⇒ ${entry.path}`) +
        pico.red("").repeat(duplicates++)
      );
      continue;
    }

    const entryPath = path.join(__dirname, entry.path);
    const [time, { entry: config, error }] = await measureTime(loadEntry(entryPath))

    if (error) {
      console.error(pico.red(` - Fail to load: ${entry}`));
      console.error(error);
      continue;
    }

    lang_parsers.set(entry.name, config);
    console.log(
      pico.green(` - Entry Loaded: ${pico.cyan(entry.name)}\n`),
      pico.yellow(`   └ time: ${time}ms`)
    );
  }

  console.log(pico.cyan("Finished loading.\n"));
}

const LOAD_PARSERS_FIRST = `Parsers are not loaded! call: ${load_parsers.name}()`;

/**
* Look up time is O(1).
*
* Initialize the parsers, before retrieving.
* @param {String} language
* @returns {Language=}
* @throws if parsers are not loaded yet.
*/
function hasLanguageParser(language) {
  if (!parser) throw Error(LOAD_PARSERS_FIRST);
  return lang_parsers.get(language?.toLowerCase());
}

/**
* Look up time is O(1).
*
* Initialize the parsers, before checking.
* @param {String} language
* @returns {Boolean}
* @throws if parsers are not loaded yet.
*/
function doesLanguageParserExist(language) {
  if (!parser) throw Error(LOAD_PARSERS_FIRST);
  return lang_parsers.has(language?.toLowerCase());
}

module.exports = {
  getParser: () => parser,
  getLoadedParsers: () => lang_parsers,
  getLanguageParser: hasLanguageParser,
  doesLanguageParserExist: doesLanguageParserExist,
  load_parsers: load_parsers
}