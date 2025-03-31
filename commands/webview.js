const fs = require("fs");
const path = require("path");

const { createWebviewPanel, Notify } = require("./vsUtil");

/** @type {import("vscode").WebviewPanel?} */
let panelRef;

function createWebview() {
  if (!panelRef) {
    const identifier = "codexview.panel";
    const title = "CodeXview Generated Diagram";
    panelRef = createWebviewPanel(identifier, title);
  }

  panelRef.webview.html = getWebviewContent();

  panelRef.webview.onDidReceiveMessage((message) => {
    Notify.error(message);
  })

  panelRef.onDidDispose(() => {
    panelRef = null;
  });
}

function getWebviewContent() {
  let contentHTML = fs.readFileSync(
    path.join(__dirname, "./panels/mainWebview.html"),
    "utf8"
  );

  // read index.js script.
  const scriptContent = fs.readFileSync(
    path.join(__dirname, "./panels/index.js"),
    "utf8"
  );

  // replace template with contents of index.js.
  contentHTML = contentHTML.replace('"{{__script__}}"', scriptContent);

  return contentHTML;
}

module.exports = {
  createWebview: createWebview
}