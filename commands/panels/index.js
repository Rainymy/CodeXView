// eslint-disable-next-line no-undef
const vscode = acquireVsCodeApi();
const counter = document.getElementById("lines-of-code-counter");

let count = 0;
let intervalID = setInterval(() => {
  counter.textContent = (count++).toString();

  // stop the interval;
  if (count > 100) return clearInterval(intervalID);

  // Alert the extension when our cat introduces a bug
  if (Math.random() < 0.001 * count) {
    vscode.postMessage(`🐛  Bug on line:  ${count}`);
  }
}, 250);