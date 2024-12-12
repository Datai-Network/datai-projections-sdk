const fs = require('fs')
const path = require('path')

function createLibFiles() {
  // UniswapV2Pair.ts
  const templateContent = require('./files-content/libs/templateContent')
  const templatePath = path.join(
    'projections',
    'assembly',
    'libs',
    'templates',
    'UniswapV2Pair.ts'
  )
  fs.writeFileSync(templatePath, templateContent)

  // uniswap2-lib.ts
  const libContent = require('./files-content/libs/libContent')
  const libPath = path.join(
    'projections',
    'assembly',
    'libs',
    'uniswap2-lib.ts'
  )
  fs.writeFileSync(libPath, libContent)
}

module.exports = { createLibFiles }
