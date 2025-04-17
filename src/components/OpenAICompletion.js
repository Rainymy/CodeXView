const fs = require("node:fs");
const path = require("node:path");

const { AzureOpenAI } = require("openai");

const { KeyVault, SECRET_ENUM } = require("./Keyvault");
const { readCCDExample, readPrompt } = require("../utils/fileHandler");

class OpenAICompletion {
  /** @type {AzureOpenAI|null} */ #client = null;

  async init() {
    if (this.#client) {
      return;
    }
    KeyVault.init();
    this.#client = await this.#createClient();
  }

  /**
  * Azure OpenAI require Cognitive Services.
  * Which requires one of following permissions:
  * - Cognitive Services OpenAI User
  * - Cognitive Services OpenAI Contributor
  *
  * We dont have any of this. So we are using API Key directly.
  */
  async #createClient() {
    return new AzureOpenAI({
      apiVersion: "2025-01-01-preview", // MUST be valid SDK version
      deployment: await KeyVault.getSecret(SECRET_ENUM.MODEL_DEV_NAME),
      apiKey: await KeyVault.getSecret(SECRET_ENUM.KEY),
      endpoint: await KeyVault.getSecret(SECRET_ENUM.OPENAI)
    });
  }

  async getChatResponse() {
    const responses = await this.#client.chat.completions.create({
      messages: [
        {
          role: "system",
          content: readPrompt()
        },
        {
          role: "user",
          content: readCCDExample()
        },
        {
          role: "user",
          content: this.#randomJSFile()
        }
      ],
      // number of completion choices to recieve
      n: 1,
      model: "gpt-4.1-mini"
    });

    for (const response of responses.choices) {
      console.log(response.message.content);
    }
  }

  /**
  * this is `AST`, pre parsed file (random js file)
  * @returns
  */
  #randomJSFile() {
    return fs.readFileSync(path.join(__dirname, "./temp.txt"), "utf8")
  }
}

// (async () => {
//   const a = new OpenAICompletion();
//   await a.init();
//   a.getChatResponse();
// })();

module.exports = new OpenAICompletion();