class AIConnection {
  constructor() {
    this.apiUrl = "";
    this.diagramCode = "";
  }

  async getChatResponse(parsedCode) {
    try {
      const response = await fetch('http://localhost:5191/o1Chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userMessage: parsedCode })
      });

      if (!response.ok) {
        throw new Error('Network response was not ok ' + response.statusText);
      }

      this.diagramCode = await response.text();

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

const AIConnectionInstance = new AIConnection();
module.exports = AIConnectionInstance;