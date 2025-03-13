const pico = require("picocolors");
const fs = require("fs");

const { Parser, Language } = require("web-tree-sitter");

const { parseFolder } = require("./provider");

/**
 * @typedef {import('./language.d.ts').LoadEntry} LoadEntry
 * @typedef {import('./language.d.ts').languageEntry} languageEntry
 */

/** @type {Parser} */
let parser = null;
const lang_parsers = new Map();

async function load_parsers() {
  await Parser.init();
  parser = new Parser();

  const shadow = new Map();
  const entries = parseFolder();

  if (entries.length === 0) {
    console.error(pico.red(` - No Entries Found!`));
  }

  for (const entry of entries) {
    const { entry: config, error, extra } = await loadEntry(entry);

    if (error) {
      console.error(pico.red(` - Fail to load: ${entry}`));
      console.error(error);
      continue;
    }

    if (lang_parsers.has(extra.name)) {
      const pre = shadow.get(extra.name);
      console.error(pico.yellow(` - Duplicate Entry:\n\t${entry}\n\t${pre}`));
      continue;
    }

    shadow.set(extra.name, entry);
    lang_parsers.set(extra.name, config);
    console.log(pico.green(` - Entry Loaded: ${extra.name}`));
  }

  console.log(pico.cyan("Finished loading."));
}

/**
* @param {String} pathFs
* @returns {Promise<LoadEntry>}
*/
async function loadEntry(pathFs) {
  try {
    /** @type {languageEntry} */
    const entry = require(pathFs);
    const parserLanguage = await loadParserWASM(entry.absolutePath);

    // @ts-ignore
    return { entry: parserLanguage, error: null, extra: entry };
  }
  catch (err) {
    return { entry: null, error: err, extra: null };
  }
}

async function loadParserWASM(pathFs) {
  const data = new Uint8Array(fs.readFileSync(pathFs));
  const ParserLanguage = await Language.load(data);
  return ParserLanguage;
}

module.exports = {
  getParser: () => parser,
  getLoadedParsers: () => lang_parsers,
  load_parsers: load_parsers
}