const { KeyVault, SECRET_ENUM } = require("./Keyvault");

/**
* Don't forget to establish connection with KeyVault first.
*/
function AIConnection() {
  let url = null;
  let key = null;

  this.init = async () => {
    url = await KeyVault.getSecret(SECRET_ENUM.URL);
    key = await KeyVault.getSecret(SECRET_ENUM.KEY);

    return this;
  }

  this.getChatResponse = async (parsedCode) => {
    // send parsedCode to AI
    // Connect to AI trough azure online app.
    console.log("url:", url);
    console.log("key:", key);
    return;
  }
}

module.exports = AIConnection;


