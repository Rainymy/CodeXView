// default terminal width.
const terminalWidth = process.stdout.columns ?? 45;
// value: maximum - preferred - minimum
const columns = clamp(125, terminalWidth * 0.8, 40);

const DEFAULT_PADDING_SYMBOL = "-";
const DEFAULT_TITLE_SYMBOL = "-";

/**
* @param {String} text
* @param {Number} width
* @returns {String}
*/
function centerText(text, width) {
  const newTextWidth = width + countAnsiEscapeChars(text);
  const paddingAmount = newTextWidth - text.length;
  const leftPadding = Math.floor(paddingAmount / 2);
  return text
    .padStart(text.length + leftPadding, DEFAULT_TITLE_SYMBOL)
    .padEnd(newTextWidth, DEFAULT_TITLE_SYMBOL);
}

/**
* @param {String} str
*/
function countAnsiEscapeChars(str) {
  const ansiRegex = /\x1B\[[0-9;]*[A-Za-z]/g;
  const matches = str.match(ansiRegex);
  return matches ? matches.join('').length : 0;
};

/**
* @param {String} text
* @param {Number?} width
* @param {String?} symbol
*/
function printFancyTitle(text, width = columns, symbol = DEFAULT_PADDING_SYMBOL) {
  printFancyMultilineTitle([text]);
}

/**
* @param {String[]} titles
* @param {Number?} width
* @param {String?} symbol
*/
function printFancyMultilineTitle(
  titles, width = columns, symbol = DEFAULT_PADDING_SYMBOL
) {
  console.log(symbol.repeat(width));
  for (const title of titles) {
    console.log(centerText(title, width));
  }
  console.log(symbol.repeat(width));
}

/**
*
* @param {Number} maxv
* @param {Number} value
* @param {Number} minv
* @returns
*/
function clamp(maxv, value, minv) {
  return Math.min(maxv, Math.max(value, minv));
}

module.exports = {
  centerText: centerText,
  printFancyTitle: printFancyTitle,
  printFancyMultilineTitle: printFancyMultilineTitle
}