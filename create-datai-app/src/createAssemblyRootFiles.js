const fs = require('fs')
const path = require('path')

function createAssemblyRootFiles() {
  // .gitignore
  const gitignoreContent = require('./files-content/assembly/gitignoreContent')
  const gitignorePath = path.join('projections', 'assembly', '.gitignore')
  fs.writeFileSync(gitignorePath, gitignoreContent)

  // tsconfig.json
  const tsconfigContent = require('./files-content/assembly/tsconfigContent')
  const tsconfigPath = path.join('projections', 'assembly', 'tsconfig.json')
  fs.writeFileSync(tsconfigPath, tsconfigContent)
}

module.exports = { createAssemblyRootFiles }
