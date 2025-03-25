const path = require("path");
const fs = require("fs");

const { Parser, Language } = require("web-tree-sitter");
const pico = require("picocolors");

const { printFancyTitle } = require("../src/utils/fancyTitle");

/** @type {Entries} */
const entries = require("./entries.json");

/**
 * @typedef {import('./language').LoadEntry} LoadEntry
 * @typedef {import('./language').Entries} Entries
 */

/** @type {Parser} */
let parser = null;
let isParsersLoaded = false;
const lang_parsers = new Map();

async function load_parsers() {
  printFancyTitle("Getting Loaders Ready");

  await Parser.init();
  parser = new Parser();

  if (entries.length === 0) {
    console.error(pico.red(` - No Entries Found!`));
  }

  for (const entry of entries) {
    // check for duplicate entries.
    if (lang_parsers.has(entry.name)) {
      console.error(
        pico.yellow(` - Duplicate Entry:\n\t${entry.name} ⇒ ${entry.path}`)
      );
      continue;
    }

    const entryPath = path.join(__dirname, entry.path);
    const { entry: config, error } = await loadEntry(entryPath);

    if (error) {
      console.error(pico.red(` - Fail to load: ${entry}`));
      console.error(error);
      continue;
    }

    lang_parsers.set(entry.name, config);
    console.log(pico.green(` - Entry Loaded: ${pico.cyan(entry.name)}`));
  }

  isParsersLoaded = true;
  console.log(pico.cyan("Finished loading.\n"));
}

/**
* @param {String} entryFile
* @returns {Promise<LoadEntry>}
*/
async function loadEntry(entryFile) {
  try {
    return { entry: await loadParserWASM(entryFile), error: null };
  }
  catch (err) {
    return { entry: null, error: err };
  }
}

/**
* @param {String} pathFs
* @returns {Promise<Language>}
*/
async function loadParserWASM(pathFs) {
  const data = new Uint8Array(fs.readFileSync(pathFs));
  return await Language.load(data);
}

/**
* Look up time is O(1).
*
* Initialize the parsers, before retrieving.
* @param {String} language
* @returns {Language=}
*/
function getLanguageParser(language) {
  if (!isParsersLoaded) throw Error("Parsers are not loaded yet!");
  return lang_parsers.get(language?.toLowerCase());
}

module.exports = {
  getParser: () => parser,
  getLoadedParsers: () => lang_parsers,
  getLanguageParser: getLanguageParser,
  load_parsers: load_parsers
}