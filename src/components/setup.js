const { ensureFolderSync } = require("../utils/fileHandler");
const ProjectConfig = require("./ProjectConfig");

function ensure_structure() {
  const messages = [];
  // check permission - is file / folder creation allowed?
  // create necessary folders and files.
  if (ProjectConfig.canCreateFolder()) {
    const isFolderOK = ensureFolderSync(ProjectConfig.getOutputFolder());
    if (!isFolderOK) { return { info: null, fatal: "Folder is not okey." } }
  }
  else { messages.push('Create Folder permission is denied!'); }

  if (!ProjectConfig.canCreateFile()) {
    messages.push('Create File permission is denied!');
  }

  return { info: messages, fatal: null }
}

module.exports = { ensure_structure };