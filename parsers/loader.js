const path = require("path");
const fs = require("fs");
const pico = require("picocolors");

const { binaryEntries } = require("./provider");

/**
 * @typedef {import('./language.d.ts').Language} Language
 * @typedef {import('./language.d.ts').LoadEntry} LoadEntry
 */


function load_parsers() {
  /** @type {Map<String, Language>} */
  const lang_parsers = new Map();
  const shadow = new Map();
  const entries = parseFolder();

  if (entries.length === 0) {
    console.error(pico.red(` - No Entries Found!`));
  }

  for (const entry of entries) {
    const { entry: config, error } = loadEntry(entry);

    if (error) {
      console.error(pico.red(` - Fail to load: ${entry}`));
      console.error(error);
      continue;
    }

    if (lang_parsers.has(config.name)) {
      const pre = shadow.get(config.name);
      console.error(pico.yellow(` - Duplicate Entry:\n\t${entry}\n\t${pre}`));
      continue;
    }

    shadow.set(config.name, entry);
    lang_parsers.set(config.name, config);
    console.log(pico.green(` - Entry Loaded: ${config.name}`));
  }

  console.log(pico.cyan("Finished loading."));
  return lang_parsers;
}

/**
* @param {String} pathFs
* @returns {LoadEntry}
*/
function loadEntry(pathFs) {
  try {
    /** @type {import("./language.d.ts").languageEntry} */
    const entry = require(pathFs);
    return { entry: require(entry.absolutePath), error: null };
  }
  catch (err) {
    return { entry: null, error: err };
  }
}

/**
* Retreive files recursively.
* - ONLY handles DIRECTORY and FILE.
* - filters file by entry filename from `providor.js`
* @return {String[]}
*/
function parseFolder() {
  const item = [__dirname];
  const files = [];

  // recursively read folder.
  while (item.length) {
    const element = item.pop();
    const stat = fs.lstatSync(element);

    if (stat.isDirectory()) {
      item.unshift(
        ...fs.readdirSync(element).map(v => path.join(element, v))
      );
    }
    if (stat.isFile()) { files.push({ stat: stat, pathFs: element }); }
  }

  // filter by filename (ex. index.js);
  const entryFiles = files.filter((file) => {
    const filename = path.basename(file.pathFs);
    return filename.toLowerCase() === binaryEntries.toLowerCase()
  });

  return entryFiles.map((v) => v.pathFs);
}

module.exports = load_parsers;