# 📊 CodeXView

**CodeXView** is a VS Code extension and visualization tool to automatically generate dynamic code interactions from **source code** / **codebase**.

---

## 🚀 Features

- 📈 Visualizes code relationships and interactions dynamically.
- 🌍 Multi-language support (currently limited).
- 🧠 LLM-powered diagram analysis.

---

## 📦 Requirements

- **Node.js**: (v20+)
- **VS Code**: (1.98+)
- 🌍 Internet access (for LLM integration)
- 🧠 Optional: Local LLM setup (e.g., LLaMA or HuggingFace for offline use)

---

## ⚙️ Extension Settings

> ⚠️ *Note: Settings are not implemented yet.*

Include if your extension adds any VS Code settings through the `contributes.configuration` extension point.

For example:

This extension contributes the following settings to VS Code:

- `codexview.enable`: Enable/disable CodeXView.
- `codexview.languageSupport`: Define supported languages (`ts`, `js`, `py`, etc.)
- `codexview.llmProvider`: Set the LLM backend (e.g., `openai`, `huggingface`)
- `codexview.diagramOutputPath`: Output path for the generated diagram.

---

## 🔧 Usage

1. Open a project folder in VS Code.
2. Open Command Palette (`Ctrl+Shift+P` or `Cmd+Shift+P`) and select:
   ➤ `Run CodeXView`
3. View the generated diagram in the preview panel.
4. (Optional): Adjust settings via `Extension Settings` (when available).

---

## 📃 License

### 📒 Project Code:
License is pending (all rights reserved). See the [LICENSE](./LICENSE).

### 📦 Prebuilt Binaries:
All prebuilt binaries included in this project (located in the `parsers/<language>` folder) are distributed under the MIT License.
The corresponding license text can be found in the `./parsers/<language>/LICENSE` file.

> By using these binaries, you agree to the terms of the MIT License.

---

## 💡 Working with Markdown

You can author your README using Visual Studio Code.  Here are some useful editor keyboard shortcuts:

* Split the editor (`Cmd+\` on macOS or `Ctrl+\` on Windows and Linux)
* Toggle preview (`Shift+Cmd+V` on macOS or `Shift+Ctrl+V` on Windows and Linux)
* Press `Ctrl+Space` (Windows, Linux, macOS) to see a list of Markdown snippets

## 📚 For more information

* [Visual Studio Code's Markdown Support](http://code.visualstudio.com/docs/languages/markdown)
* [Markdown Syntax Reference](https://help.github.com/articles/markdown-basics/)

---