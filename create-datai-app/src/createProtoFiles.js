const fs = require('fs')
const path = require('path')

function createProtoFiles() {
  // activePositions.proto
  const activePositionsContent = require('./files-content/proto/activePositionsContent')
  const activePositionsPath = path.join('API', 'v1', 'activePositions.proto')
  fs.writeFileSync(activePositionsPath, activePositionsContent)

  // bigDecimal.proto
  const bigDecimalContent = require('./files-content/proto/bigDecimalContent')
  const bigDecimalPath = path.join('API', 'v1', 'bigDecimal.proto')
  fs.writeFileSync(bigDecimalPath, bigDecimalContent)

  // ethereum.proto
  const ethereumContent = require('./files-content/proto/ethereumContent')
  const ethereumPath = path.join('API', 'v1', 'ethereum.proto')
  fs.writeFileSync(ethereumPath, ethereumContent)

  // store.proto
  const storeContent = require('./files-content/proto/storeContent')
  const storePath = path.join('API', 'v1', 'store.proto')
  fs.writeFileSync(storePath, storeContent)

  // watcher.proto
  const watcherContent = require('./files-content/proto/watcherContent')
  const watcherPath = path.join('API', 'v1', 'watcher.proto')
  fs.writeFileSync(watcherPath, watcherContent)
}

module.exports = { createProtoFiles }
