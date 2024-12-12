const fs = require('fs')

function createRootFiles() {
  // .env
  const envContent = require('./files-content/root/envContent')
  const envPath = '.env'
  fs.writeFileSync(envPath, envContent)

  // .env.example
  const envexampleContent = require('./files-content/root/envexampleContent')
  const envexamplePath = '.env.example'
  fs.writeFileSync(envexamplePath, envexampleContent)

  // .gitignore
  const gitignoreContent = require('./files-content/root/gitignoreContent')
  const gitignorePath = '.gitignore'
  fs.writeFileSync(gitignorePath, gitignoreContent)

  // .gitattributes
  const gitattributesContent = require('./files-content/root/gitattributesContent')
  const gitattributesPath = '.gitattributes'
  fs.writeFileSync(gitattributesPath, gitattributesContent)

  // docker-compose.yml
  const dockercomposeContent = require('./files-content/root/dockercomposeContent')
  const dockercomposePath = 'docker-compose.yml'
  fs.writeFileSync(dockercomposePath, dockercomposeContent)

  // common.env
  const commonenvContent = require('./files-content/root/commonenvContent')
  const commonengPath = 'common.env'
  fs.writeFileSync(commonengPath, commonenvContent)

  // README.md
  const readmeContent = require('./files-content/root/readmeContent')
  const readmePath = 'README.md'
  fs.writeFileSync(readmePath, readmeContent)
}

module.exports = { createRootFiles }
