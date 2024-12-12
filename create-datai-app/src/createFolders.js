const fs = require('fs')

const paths = [
  '.devcontainer/projections',
  'projections/assembly/libs/templates',
  'projections/assembly/templates/uniswap2_liquidity/abis',
  'projections/assembly/templates/uniswap2_liquidity/subgraph/mappings',
  'projections/assembly/templates/uniswap2_liquidity/watcher',
  'projections/assembly/protocols/uniswap2.liquidity_pool/mainnet',
  'projections/typescript',
  'API/v1',
  'graph-node/config',
]

function createFolders() {
  for (let i = 0; i < paths.length; i++) {
    // Create folder
    if (!fs.existsSync(paths[i])) {
      fs.mkdirSync(paths[i], { recursive: true })
    }
  }
}

module.exports = { createFolders }
