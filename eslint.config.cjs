
module.exports = [
  {
    files: ["**/*.js"],
    rules: {
      "no-const-assign": "warn",
      "no-this-before-super": "warn",
      "no-undef": "warn",
      "no-unreachable": "warn",
      "no-unused-vars": "warn",
      "constructor-super": "warn",
      "valid-typeof": "warn",
    }
  },
  {
    ignores: [
      ".vscode*/", // ignore all folders starting with .vscode
      "dist/",
      "output/",
      "**.d.ts"
    ]
  }
];