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
 * Build prompt + call o3 using the slim summary.
 * @param {object} summary  // the object printed as “Slim JSON”
 * @returns {Promise<string|null>}
 */
  async getChatResponse(summary, feedback = null) {
    const generator = new IDGenerator();
    // const parse = [this.randomJSFile()]; // replace this with `parsedCode`

    const basePrompt = readPrompt();      // file contains {{PUT-THE-REAL-SUMMARY-JSON-HERE}}
    
    // 2) inject the summary JSON
    let prompt = basePrompt.replace(
      "{{PUT-THE-REAL-SUMMARY-JSON-HERE}}",
      JSON.stringify(summary, null, 2)
    );
    if (feedback) {
      prompt += `\n\nNote: ${feedback}`;
    }
    console.log("feedback", feedback);
    console.log("Prompt:\n", prompt);
  // 3) single-message chat call
  const completion = await this.#client.chat.completions.create({
    messages: [{ role: "system", content: prompt }],
    model: "o3",
    temperature: 0.2,
    n: 1
  });

  return completion.choices[0].message.content;
  }

  /**
  * @template T
  * @param {T[]} tree
  * @param {Number?} chunkSize
  * @returns {T[][]}
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
    const partOf = `Part ${index + 1} of ${arr.length}`;

    /** @param {String} str */
    const codeBlock = (str) => `\`\`\`json\n${str}\n\`\`\``;

    /** @type {ChatCompletionMessageParam} */
    const param = {
      role: "user",
      content: `${partOf}:\n${codeBlock(JSON.stringify(item, null, 2))}`
    }
    return param;
  }

  
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
//   await ai.getChatResponse([]);
// })();

module.exports = new OpenAICompletion();