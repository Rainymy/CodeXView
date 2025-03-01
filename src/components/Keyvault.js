const { SecretClient } = require("@azure/keyvault-secrets");
const { DefaultAzureCredential } = require("@azure/identity");


/**
* KeyVault is a singleton.
*
* You need to download azure-cli. After run -
* `az login`
*/
function KeyVault() {
  const keyVaultURL = "https://kv-codexview.vault.azure.net/";
  /** @type {SecretClient|null} client */
  let client = null;

  const secretKeys = {
    KEY: "Ai-Key-mini-o1",
    URL: "Ai-url-mini-o1"
  };

  /**
  * Establish connection with KeyVualt.
  */
  this.init = () => {
    const credential = new DefaultAzureCredential();
    client = new SecretClient(keyVaultURL, credential);
  }

  /**
  * @param {String=} key
  * @returns
  */
  this.getSecret = async (key) => {
    if (!client) throw Error("Client not found");
    if (typeof key !== "string") throw Error("Invalid key")

    const objKeys = Object.keys(secretKeys);
    const getKey = objKeys.find((v) => key === v.toLowerCase());

    // getSecret throws if secret not found.
    const secret = await client.getSecret(getKey ?? key);

    console.log(secret);

    return secret.value;
  }
}

module.exports = new KeyVault();