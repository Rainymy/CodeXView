const { SecretClient } = require("@azure/keyvault-secrets");
const { DefaultAzureCredential } = require("@azure/identity");

const SECRET_ENUM = {
  KEY: "KEY",
  URL: "URL",
  PASSWORD: "PASSWORD"
}

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

  const SecretKeys = {
    [SECRET_ENUM.KEY]: "Ai-Key-mini-o1",
    [SECRET_ENUM.URL]: "Ai-url-mini-o1",
    [SECRET_ENUM.PASSWORD]: "SecretApiPassword"
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
  * @throws if secret not found
  */
  this.getSecret = async (key) => {
    if (!client) throw Error("Client not found");
    if (typeof key !== "string" || !SecretKeys[key]) throw Error("Invalid key")

    // getSecret throws if secret not found.
    const secret = await client.getSecret(SecretKeys[key]);

    return secret.value;
  }
}

module.exports = {
  KeyVault: new KeyVault(),
  SECRET_ENUM: SECRET_ENUM
}