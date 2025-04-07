const isVSCode = require("./isVSCode");
const { ConfigKeys } = require("../../configKeys");

/**
* @typedef {import("vscode").WorkspaceConfiguration} WorkspaceConfiguration
*/

function fallbackConfig() {
  /** @type {WorkspaceConfiguration} */
  // @ts-ignore
  const devSettings = new Map();

  const { contributes } = require("../../package.json");
  const props = contributes.configuration[0].properties;

  for (const key in props) {
    const prefix = key.split(`${ConfigKeys.Name}.`)[1];

    devSettings.set(prefix, props[key].default);
  }

  return devSettings;
}

/**
* When using Fallback Config, inspect & update functions are `undefined`.
* @param {String} name Name of the extension to get `getConfiguration`
* @returns
*/
function configSetting(name) {
  if (isVSCode()) {
    const vscode = require("vscode");
    return vscode.workspace.getConfiguration(name);
  }

  return fallbackConfig();
}

module.exports = {
  configSetting: configSetting
}