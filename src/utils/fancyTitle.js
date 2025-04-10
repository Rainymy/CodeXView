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

function ansiRegex() {
  // Valid string terminator sequences are BEL, ESC\, and 0x9c
  const ST = '(?:\\u0007|\\u001B\\u005C|\\u009C)';

  const pattern = [
    `[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]+)*|[a-zA-Z\\d]+(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?${ST})`,
    '(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-nq-uy=><~]))',
  ].join('|');
  return new RegExp(pattern, 'g');
}

/**
* @param {String} str
*/
function countAnsiEscapeChars(str) {
  const matches = str.match(ansiRegex());
  return matches ? matches.join('').length : 0;
};

/**
* @param {String} text
* @param {Number?} width
* @param {String?} symbol
*/
function printFancyTitle(text, width = columns, symbol = DEFAULT_PADDING_SYMBOL) {
  printFancyMultilineTitle([text], width, symbol);
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
    console.log(centerText(` ${title} `, width));
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
  printFancyMultilineTitle: printFancyMultilineTitle,
  columns: columns
}