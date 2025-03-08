const child_process = require('node:child_process');

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

// main entry
for (const platform of Object.keys(BUILD_TARGET)) {
  for (const arch of BUILD_TARGET[platform]) {
    printFancyTitle(` Building: ${platform}-${arch} `);

    const script = `prebuildify --napi --platform ${platform} --arch ${arch}`;
    child_process.execSync(script, { stdio: "inherit" });
  }
}
printFancyTitle(` Successfully compiled. `);


// =================== UTILS ===================
function centerText(text = "", width = 0) {
  const leftPadding = Math.floor((width - text.length) / 2);
  return text.padStart(text.length + leftPadding, '-').padEnd(width, '-');
}

/** @param {String} text */
function printFancyTitle(text, width = 45, symbol = "-") {
  console.log(symbol.repeat(width));
  console.log(centerText(text, width));
  console.log(symbol.repeat(width));
}