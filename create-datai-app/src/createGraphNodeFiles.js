const fs = require('fs')
const path = require('path')

function createGraphNodeFiles() {
  // config.toml
  const configContent = require('./files-content/graph-node/configContent')
  const configPath = path.join('graph-node', 'config', 'config.toml')
  fs.writeFileSync(configPath, configContent)
}

module.exports = { createGraphNodeFiles }
