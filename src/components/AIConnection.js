const { KeyVault, SECRET_ENUM } = require("./Keyvault");
const { readCCDExample } = require("../utils/fileHandler");

/**
* @typedef {import("../../parsers/utils").SyntaxTreeJSON} SyntaxTreeJSON
*/

class AIConnection {
  /** @type {String} */ #apiUrl = null;
  /** @type {String} */ #apiKey = null;
  /** @type {String} */ #password = null;
  /** @type {String} */ #prompt = null;

  async init() {
    this.#apiUrl = await KeyVault.getSecret(SECRET_ENUM.URL);
    this.#apiKey = await KeyVault.getSecret(SECRET_ENUM.KEY);
    this.#password = await KeyVault.getSecret(SECRET_ENUM.PASSWORD);
  }

  /**
  * @param {String} prompt
  */
  setPrompt(prompt) {
    this.#prompt = prompt;
  }

  /**
  *
  * @param {SyntaxTreeJSON|SyntaxTreeJSON[]} parsedCode
  * @returns {Promise<String|null>}
  */
  async getChatResponse(parsedCode) {
    try {
      const response = await fetch(this.#apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'SecretKey': this.#password
        },
        body: JSON.stringify({
          systemPrompt: this.#prompt,
          cccExample: readCCDExample(),
          diagramCode: parsedCode
        })
      });

      if (!response.ok) {
        throw new Error(response.statusText);
      }

      return await response.text();

    } catch (error) {
      console.error(
        `[ AIConnection.${this.getChatResponse.name} ]:`,
        error
      );
      return null;
    }
  }
}

module.exports = new AIConnection();