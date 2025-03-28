const pico = require("picocolors");

/**
 * @typedef {Object} AssetStatus
 * @property {string} emoji - Emoji representing the status
 * @property {string} message - Descriptive message for the status
 * @property {(text: string) => string} color - Picocolors color function
 */

/**
 * @typedef {'OK' | 'FAIL' | 'OVERWRITE' | 'EXISTS'} AssetStatusKey
 */

/** @type {Record<AssetStatusKey, String>} */
const STATUS_KEY = {
  OK: 'OK',
  FAIL: 'FAIL',
  OVERWRITE: 'OVERWRITE',
  EXISTS: 'EXISTS'
}

/** @type {Record<AssetStatusKey, AssetStatus>} */
// @ts-ignore
const ASSET_STATUS = {
  [STATUS_KEY.OK]: {
    emoji: "📄",
    message: "Copied asset:",
    color: pico.green
  },
  [STATUS_KEY.FAIL]: {
    emoji: "💥",
    message: "Asset failed:",
    color: pico.red
  },
  [STATUS_KEY.OVERWRITE]: {
    emoji: "❌",
    message: "Overwrite detected:",
    color: pico.yellow
  },
  [STATUS_KEY.EXISTS]: {
    emoji: "⚠️",
    message: "Skipped missing file:",
    color: pico.magenta
  },
}

/**
*
* @param {String} statusKey
* @param {String} source
* @param {String} output
*/
function logAssetTransfare(statusKey, source, output) {
  const status = ASSET_STATUS[statusKey];

  if (!status) {
    console.log(pico.red(`❓ Unknown status: ${statusKey}`));
    return;
  }

  const coloredMessage = status.color(`${status.emoji} ${status.message}`);

  const message = [
    pico.bold(coloredMessage),
    source ? pico.dim("   • From: ") + pico.cyan(source) : "",
    output ? pico.dim("   → To:   ") + pico.magenta(output) : ""
  ]
    .filter(v => v)
    .map(v => `| ${v}`)
    .join("\n");

  console.log(message);
}

module.exports = {
  logAssetTransfare,
  STATUS_KEY: STATUS_KEY
}