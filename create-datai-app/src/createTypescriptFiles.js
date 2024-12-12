const fs = require('fs')
const path = require('path')

function createTypescriptFiles() {
  // build.ts
  const buildContent = require('./files-content/typescript/buildContent')
  const buildPath = path.join('projections', 'typescript', 'build.ts')
  fs.writeFileSync(buildPath, buildContent)

  // buildProto.ts
  const buildProtoContent = require('./files-content/typescript/buildProtoContent')
  const buildProtoPath = path.join('projections', 'typescript', 'buildProto.ts')
  fs.writeFileSync(buildProtoPath, buildProtoContent)

  // common.ts
  const commonContent = require('./files-content/typescript/commonContent')
  const commonPath = path.join('projections', 'typescript', 'common.ts')
  fs.writeFileSync(commonPath, commonContent)

  // deploy.ts
  const deployContent = require('./files-content/typescript/deployContent')
  const deployPath = path.join('projections', 'typescript', 'deploy.ts')
  fs.writeFileSync(deployPath, deployContent)

  // launch.ts
  const launchContent = require('./files-content/typescript/launchContent')
  const launchPath = path.join('projections', 'typescript', 'launch.ts')
  fs.writeFileSync(launchPath, launchContent)

  // ts-node.register.mjs
  const registerContent = require('./files-content/typescript/registerContent')
  const registerPath = path.join(
    'projections',
    'typescript',
    'ts-node.register.mjs'
  )
  fs.writeFileSync(registerPath, registerContent)

  // submit.ts
  const submitContent = require('./files-content/typescript/submitContent')
  const submitPath = path.join('projections', 'typescript', 'submit.ts')
  fs.writeFileSync(submitPath, submitContent)

  // tsconfig.json
  const tsconfigContent = require('./files-content/typescript/tsconfigContent')
  const tsconfigPath = path.join('projections', 'typescript', 'tsconfig.json')
  fs.writeFileSync(tsconfigPath, tsconfigContent)
}

module.exports = { createTypescriptFiles }
