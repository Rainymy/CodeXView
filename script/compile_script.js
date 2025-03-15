const child_process = require('node:child_process');
// default terminal width.
const tw = process.stdout.columns ?? 45;
// value: maximum - preferred - minimum
const columns = clamp(125, tw * 0.8, 40);

// process.arch values
const BUILD_ARCH = { X64: "x64", ARM64: "arm64" }
// process.platform values
const BUILD_PLATFROM = {
  WIN: "win32",   // win32  => {x64, arm64}
  LINUX: "linux", // linux  => {x64, arm64}
  MAC: "darwin"   // darwin => {x64, arm64}
}

const BUILD_TARGET = {
  [BUILD_PLATFROM.WIN]: [BUILD_ARCH.X64, BUILD_ARCH.ARM64],
  [BUILD_PLATFROM.LINUX]: [BUILD_ARCH.X64, BUILD_ARCH.ARM64],
  [BUILD_PLATFROM.MAC]: [BUILD_ARCH.X64, BUILD_ARCH.ARM64],
}

printFancyTitle(" Compiler Script. ");
child_process.execSync("npm install", { stdio: "inherit" });
child_process.execSync("npm audit fix", { stdio: "inherit" });

// main entry
for (const platform of Object.keys(BUILD_TARGET)) {
  for (const arch of BUILD_TARGET[platform]) {
    printFancyTitle(` Platform: ${platform}, Arch: ${arch} `);
    const script = `prebuildify --napi --platform ${platform} --arch ${arch}`;
    child_process.execSync(script, { stdio: "inherit" });
  }
}
printFancyTitle(" Successfully compiled. ");


// =================== UTILS ===================
function centerText(text = "", width = 0) {
  const leftPadding = Math.floor((width - text.length) / 2);
  return text.padStart(text.length + leftPadding, '-').padEnd(width, '-');
}
function clamp(maxv, value, minv) {
  return Math.min(maxv, Math.max(value, minv));
}

/** @param {String} text */
function printFancyTitle(text, symbol = "-") {
  console.log(symbol.repeat(columns));
  console.log(centerText(text, columns));
  console.log(symbol.repeat(columns));
}