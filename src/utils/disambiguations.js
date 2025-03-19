const { readFileSync } = require("./fileHandler");

const { heuristics } = require("../../language/provider");

/**
* @typedef {import("../../language/heuristics.js").RulesEntity} RulesEntity
*/

/**
* Not Finished, This can handle most of the languages.
* - check: `toRegex` can't handle PCRE standard!
* @param {String} ext
* @param {String} filePath
* @returns
*/
function disambiguations(ext, filePath) {
  const fileContent = readFileSync(filePath, "utf8");

  for (const disambiguation of heuristics.disambiguations) {
    if (!disambiguation.extensions.includes(ext)) { continue; }

    for (const rule of disambiguation.rules) {
      // console.log("rule:", rule.language);
      if (!parseRules(rule, fileContent)) {
        continue;
      }
      return rule;
    }
  }
}

/**
*
* @param {RulesEntity} rules
* @param {String} fileContent
* @returns {Boolean}
*/
function parseRules(rules, fileContent) {
  if (rules.and) {
    const subRules = rules.and.map(subRule => parseRules(subRule, fileContent));
    return subRules.every(val => val);
  }

  if (rules.pattern) {
    return toRegex(rules.pattern).test(fileContent);
  }
  if (rules.negative_pattern) {
    return !toRegex(rules.negative_pattern).test(fileContent);
  }
  if (rules.named_pattern) {
    const named_patttern = heuristics.named_patterns[rules.named_pattern];
    return toRegex(named_patttern).test(fileContent)
  }

  return true;
}

/**
*
* @param {String|String[]} patterns
* @returns {RegExp}
*/
function toRegex(patterns) {
  // Built-in RegExp, cant handle PCRE RegExp standard,
  // const XRegExp = require("xregexp"); // this might be solve it.
  // npm install xregexp
  return Array.isArray(patterns)
    ? new RegExp(patterns.join("|"))
    : new RegExp(patterns);
}

module.exports = {
  disambiguations: disambiguations
}