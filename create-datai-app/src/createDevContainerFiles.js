const fs = require('fs')
const path = require('path')

function createDevContainerFiles() {
  // devcontainer.json
  const devcontainerContent = require('./files-content/devcontainer/devcontainerContent')
  const devcontainerPath = path.join(
    '.devcontainer',
    'projections',
    'devcontainer.json'
  )
  fs.writeFileSync(devcontainerPath, devcontainerContent)

  // docker-compose.devcontainer.yml
  const dockercomposeContent = require('./files-content/devcontainer/dockercomposeContent')
  const dockercomposePath = path.join(
    '.devcontainer',
    'projections',
    'docker-compose.devcontainer.yml'
  )
  fs.writeFileSync(dockercomposePath, dockercomposeContent)
}

module.exports = { createDevContainerFiles }
