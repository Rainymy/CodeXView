const { readCCDExample } = require("../utils/fileHandler");

class AIConnection {
  constructor() {
    this.apiUrl = "";
    this.apiKey = "";
    this.password = "";
    this.prompt = "";
  }

  async getChatResponse(parsedCode) {
    const cccExample = readCCDExample();
    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'SecretKey': this.password
        },
        body: JSON.stringify({
          //deploymentName: "",
          systemPrompt: this.prompt,
          cccExample: cccExample,
          diagramCode: parsedCode
          //temperature: 1.0,
        })
      });

      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.statusText}`);
      }

      return await response.text();

    } catch (error) {
      console.error('Error:', error);
    }
  }
}

// OLD version
// const { KeyVault, SECRET_ENUM } = require("./Keyvault");
//
// function AIConnection() {
//   let url = null;
//   let key = null;
//
//   this.init = async () => {
//     url = await KeyVault.getSecret(SECRET_ENUM.URL);
//     key = await KeyVault.getSecret(SECRET_ENUM.KEY);
//
//     return this;
//   }
//
//   this.getChatResponse = async (parsedCode) => {
//     // send parsedCode to AI
//     // Connect to AI trough azure online app.
//     console.log("url:", url);
//     console.log("key:", key);
//     return;
//   }
// }

module.exports = new AIConnection();