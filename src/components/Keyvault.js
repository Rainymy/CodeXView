const { SecretClient } = require("@azure/keyvault-secrets");
const { DefaultAzureCredential } = require("@azure/identity");


function KeyVault() {
  const keyVaultURL = "https://kv-codexview.vault.azure.net/";
  /** @type {SecretClient|null} client */
  let client = null;

  const secretKeys = ["Ai-Key-mini-o1", "Ai-url-mini-o1"];

  this.init = () => {
    const credential = new DefaultAzureCredential();
    client = new SecretClient(keyVaultURL, credential);
  }

  this.getSecret = async () => {
    if (!client) throw Error("Client not found");

    // just fetching first secret. i guess
    const secret = await client.getSecret(secretKeys[0]);

    console.log(secret);

    return secret.value;
  }
}

module.exports = new KeyVault();