const Keyvault = require("./Keyvault");

/**
* Don't forget to establish connection with KeyVault first.
*/
function AIConnection() {
  let url = null;
  let key = null;

  this.init = async () => {
    url = await Keyvault.getSecret("url");
    key = await Keyvault.getSecret("key");

    return this;
  }

  this.getChatResponse = async (parsedCode) => {
    // send parsedCode to AI
    // Connect to AI trough azure online app.
    return;
  }
}

module.exports = AIConnection;


