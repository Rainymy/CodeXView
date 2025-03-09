/**
* @param {String} text
* @param {Number} width
* @returns {String}
*/
function centerText(text, width) {
  const paddingAmount = width - text.length;
  const leftPadding = Math.floor(paddingAmount / 2);
  return text.padStart(text.length + leftPadding, '-').padEnd(width, '-');
}

/**
* @param {String} text
* @param {Number?} width
* @param {String?} symbol
*/
function printFancyTitle(text, width = 45, symbol = "-") {
  console.log(symbol.repeat(width));
  console.log(centerText(text, width));
  console.log(symbol.repeat(width));
}

module.exports = {
  centerText: centerText,
  printFancyTitle: printFancyTitle
}