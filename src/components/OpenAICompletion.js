const fs = require("node:fs");
const path = require("node:path");
const { AzureOpenAI, OpenAI } = require("openai");

const { KeyVault, SECRET_ENUM } = require("./Keyvault");
const { readCCDExample, readPrompt, } = require("../utils/fileHandler");
const { depthFirstTree } = require("../../parsers/utils");

const IDGenerator = require("../utils/IDGenerator");

/**
* @typedef {OpenAI.Chat.Completions.ChatCompletionMessageParam} ChatCompletionMessageParam
*/

class OpenAICompletion {
  /** @type {AzureOpenAI|null} */ #client = null;

  async init() {
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

  /**
  * @typedef {import("../../parsers/utils").SyntaxTreeJSON} SyntaxTreeJSON
  * @param {SyntaxTreeJSON|SyntaxTreeJSON[]} parsedCode
  * @returns {Promise<String|null>}
  */
  async getChatResponse(parsedCode) {
    const generator = new IDGenerator();
    const parse = this.randomJSFile(); // replace this with `parsedCode`

    const chunks = this.#chunkify(depthFirstTree(parse, generator), 200);

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
          content: this.readASTPrompt()
        },
        ...(chunks.map(this.#toChatParams))
      ],
      // number of completion choices to recieve
      n: 1,
      temperature: 0.2,
      // currently best model: https://openai.com/index/gpt-4-1/
      model: "gpt-4.1-mini"
    });

    console.log(responses.choices[0].message.content);

    return responses.choices[0].message.content;
  }

  /**
  * @typedef {import("../../parsers/utils").DepthFirstTree} DepthFirstTree
  * @param {DepthFirstTree[]} tree
  * @param {Number?} chunkSize
  */
  #chunkify(tree, chunkSize = 100) {
    const chunks = [];
    for (let i = 0, len = tree.length; i < len; i += chunkSize) {
      chunks.push(tree.slice(i, i + chunkSize))
    }
    return chunks;
  }

  /**
  * @template T
  * @param {T} item
  * @param {Number} index
  * @param {T[]} arr
  * @returns
  */
  #toChatParams(item, index, arr) {
    const partOf = `Part ${index} of ${arr.length}`;

    /** @param {String} str */
    const codeBlock = (str) => `\`\`\`json\n${str}\`\`\``;

    /** @type {ChatCompletionMessageParam} */
    const param = {
      role: "user",
      content: `${partOf}:\n${codeBlock(JSON.stringify(item))}`
    }
    return param;
  }

  /**
  * this is `AST`, pre parsed file (random js file)
  * @returns {SyntaxTreeJSON}
  */
  randomJSFile() {
    const filePath = path.join(__dirname, "../prompts/temp.txt");
    const content = fs.readFileSync(filePath, "utf8");
    return JSON.parse(content);
  }

  readASTPrompt() {
    const filePath = path.join(__dirname, "../prompts/AST-prompt.txt");
    return fs.readFileSync(filePath, "utf8");
  }
}

// (async () => {
//   const generator = new IDGenerator();
//   const ai = new OpenAICompletion();
//   await ai.init();

//   await ai.getChatResponse({ name: "", type: "", children: [] })
// })();

module.exports = new OpenAICompletion();