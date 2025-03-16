const path = require("path");
const fs = require("fs");

const ignore = require("ignore");
const pico = require("picocolors");

const ProjectConfig = require("../components/ProjectConfig");
const { printFancyMultilineTitle } = require("./fancyTitle");

const IGNORE_RULES_FILE = ".gitignore";
const DEFAULT_ADDITIONAL_RULES = [".git", "dist", IGNORE_RULES_FILE, ".env"];

const COULD_NOT_FIND_IGNORE_RULES = [
  pico.yellow(" COULD NOT FIND IGNORE RULES!! "),
  ` MISSING FILE: ${pico.red(IGNORE_RULES_FILE)} `
];

/** @type {ignore.Ignore} */
let rules = null;

function loadIgnoreRules() {
  if (!ProjectConfig.readRootIgnoreRules()) {
    rules = createIgnoreRules([]);
    return;
  }

  const root = ProjectConfig.getRootFolder();
  const ignoreFileRules = path.join(root, IGNORE_RULES_FILE);

  if (!fs.existsSync(ignoreFileRules)) {
    printFancyMultilineTitle(COULD_NOT_FIND_IGNORE_RULES);
    rules = createIgnoreRules([]);
    return;
  }

  try {
    rules = createIgnoreRules(fs.readFileSync(ignoreFileRules, "utf8"));
  }
  catch (error) {
    console.error(pico.red(`Error loading ${IGNORE_RULES_FILE}:`), error);
    rules = createIgnoreRules([]);
  }
}

/**
* @param {String|String[]} baseRules
* @returns
*/
function createIgnoreRules(baseRules) {
  return ignore().add(baseRules).add(DEFAULT_ADDITIONAL_RULES);
}

/**
* @param {String} rootFs
* @param {String} filePath
* @returns
*/
function isIgnored(rootFs, filePath) {
  if (rules === null) {
    throw Error("Initialize the rules first. `loadIgnoreRules()`");
  }

  const relativePath = path.relative(rootFs, filePath);
  const isMatch = rules.ignores(relativePath);

  // console.log(`Checking: ${relativePath} => Ignored:`, isMatch);
  return isMatch;
}

function loadAllFoldersWithIgnore() {
  const root = ProjectConfig.getRootFolder();
  const item = [...fs.readdirSync(root)];
  const files = [];

  // walk throught folder structures => FIFO.
  while (item.length) {
    const currentWalk = item.pop();
    const absoluteWalk = path.join(root, currentWalk);

    if (isIgnored(root, absoluteWalk)) {
      console.log("Ignoring: ", absoluteWalk);
      continue;
    }

    const stat = fs.lstatSync(absoluteWalk);
    if (stat.isDirectory()) {
      item.unshift(
        ...fs.readdirSync(absoluteWalk).map(v => path.join(currentWalk, v))
      );
    }
    if (stat.isFile()) {
      files.push(currentWalk);
    }
  }

  return files;
}


// requires root path to be set.
// ProjectConfig.setRootPath(path.join(__dirname, "../../"));

// loadGitIgnore(); // load ignore rules via root path.

// const folders = loadAllFoldersWithIgnore(); // all not ignored files.
// console.log(folders);

module.exports = {
  loadAllFoldersWithIgnore: loadAllFoldersWithIgnore,
  loadIgnoreRules: loadIgnoreRules
}
