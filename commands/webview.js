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
    Notify.error(message.text);
  })

  panelRef.onDidDispose(() => {
    panelRef = null;
  });
}

function getWebviewContent() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cat Coding</title>
</head>
<body>
    <img src="https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif" width="300" />
    <h1>
      Lines of Code: <span id="lines-of-code-counter">0</span>
    </h1>

    <script>
        (function() {
            const vscode = acquireVsCodeApi();
            const counter = document.getElementById('lines-of-code-counter');

            let count = 0;
            let intervalID = setInterval(() => {
                counter.textContent = count++;

                // stop the interval;
                if (count > 100) {
                  return clearInterval(intervalID);
                }

                // Alert the extension when our cat introduces a bug
                if (Math.random() < 0.001 * count) {
                    vscode.postMessage({
                        command: 'alert',
                        text: '🐛  Bug on line: ' + count
                    })
                }
            }, 250);
        }())
    </script>
</body>
</html>`;
}

module.exports = {
  createWebview: createWebview
}