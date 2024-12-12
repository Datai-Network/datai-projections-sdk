const fs = require('fs')
const path = require('path')

function createUniswap2Files() {
  // uniswap2_liquidity.yaml
  const protocolContent = require('./files-content/uniswap2/protocolContent')
  const protocolPath = path.join(
    'projections',
    'assembly',
    'protocols',
    'uniswap2.liquidity_pool',
    'mainnet',
    'uniswap2_liquidity.yaml'
  )
  fs.writeFileSync(protocolPath, protocolContent)

  // UniswapV2Factory.json
  const factoryAbiContent = require('./files-content/uniswap2/factoryAbiContent')
  const factoryAbiPath = path.join(
    'projections',
    'assembly',
    'templates',
    'uniswap2_liquidity',
    'abis',
    'UniswapV2Factory.json'
  )
  fs.writeFileSync(factoryAbiPath, factoryAbiContent)

  // UniswapV2Pair.json
  const pairAbiContent = require('./files-content/uniswap2/pairAbiContent')
  const pairAbiPath = path.join(
    'projections',
    'assembly',
    'templates',
    'uniswap2_liquidity',
    'abis',
    'UniswapV2Pair.json'
  )
  fs.writeFileSync(pairAbiPath, pairAbiContent)

  // factory.ts
  const factoryMappingContent = require('./files-content/uniswap2/factoryMappingContent')
  const factoryMappingPath = path.join(
    'projections',
    'assembly',
    'templates',
    'uniswap2_liquidity',
    'subgraph',
    'mappings',
    'factory.ts'
  )
  fs.writeFileSync(factoryMappingPath, factoryMappingContent)

  // pool.ts
  const poolMappingContent = require('./files-content/uniswap2/poolMappingContent')
  const poolMappingPath = path.join(
    'projections',
    'assembly',
    'templates',
    'uniswap2_liquidity',
    'subgraph',
    'mappings',
    'pool.ts'
  )
  fs.writeFileSync(poolMappingPath, poolMappingContent)

  // index.ts
  const watcherContent = require('./files-content/uniswap2/watcherContent')
  const watcherPath = path.join(
    'projections',
    'assembly',
    'templates',
    'uniswap2_liquidity',
    'watcher',
    'index.ts'
  )
  fs.writeFileSync(watcherPath, watcherContent)

  // schema.graphql
  const schemaContent = require('./files-content/uniswap2/schemaContent')
  const schemaPath = path.join(
    'projections',
    'assembly',
    'templates',
    'uniswap2_liquidity',
    'schema.graphql'
  )
  fs.writeFileSync(schemaPath, schemaContent)

  // subgraph.yaml
  const manifestContent = require('./files-content/uniswap2/manifestContent')
  const manifestPath = path.join(
    'projections',
    'assembly',
    'templates',
    'uniswap2_liquidity',
    'subgraph.yaml'
  )
  fs.writeFileSync(manifestPath, manifestContent)
}

module.exports = { createUniswap2Files }
