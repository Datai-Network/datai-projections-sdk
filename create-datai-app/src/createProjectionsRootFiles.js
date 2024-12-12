const fs = require('fs')
const path = require('path')

function createProjectionsRootFiles() {
  // Package.json
  const packageContent = require('./files-content/projections/packageContent')
  const packagePath = path.join('projections', 'package.json')
  fs.writeFileSync(packagePath, packageContent)

  // Prettier.config.json
  const prettierContent = require('./files-content/projections/prettierContent')
  const prettierPath = path.join('projections', 'prettier.config.json')
  fs.writeFileSync(prettierPath, prettierContent)

  // .gitignore
  const gitignoreContent = require('./files-content/projections/gitignoreContent')
  const gitignorePath = path.join('projections', '.gitignore')
  fs.writeFileSync(gitignorePath, gitignoreContent)

  // .graphqlrc.yaml
  const graphqlrcContent = require('./files-content/projections/graphqlrcContent')
  const graphqlrcPath = path.join('projections', '.graphqlrc.yaml')
  fs.writeFileSync(graphqlrcPath, graphqlrcContent)

  // .yarnrc
  const yarnrcContent = require('./files-content/projections/yarnrcContent')
  const yarnrcPath = path.join('projections', '.yarnrc')
  fs.writeFileSync(yarnrcPath, yarnrcContent)

  // Dockerfile
  const dockerfileContent = require('./files-content/projections/dockerfileContent')
  const dockerfilePath = path.join('projections', 'Dockerfile')
  fs.writeFileSync(dockerfilePath, dockerfileContent)

  // eslint.config.js
  const eslintconfigContent = require('./files-content/projections/eslintconfigContent')
  const eslintconfigPath = path.join('projections', 'eslint.config.js')
  fs.writeFileSync(eslintconfigPath, eslintconfigContent)

  // .prettierrc
  const prettierrcContent = require('./files-content/projections/prettierrcContent')
  const prettierrcPath = path.join('projections', '.prettierrc.json')
  fs.writeFileSync(prettierrcPath, prettierrcContent)

  // projections.code-workspace
  const workspaceContent = require('./files-content/projections/workspaceContent')
  const workspacePath = path.join('projections', 'projections.code-workspace')
  fs.writeFileSync(workspacePath, workspaceContent)

  // README.md
  const readmeContent = require('./files-content/projections/readmeContent')
  const readmePath = path.join('projections', 'README.md')
  fs.writeFileSync(readmePath, readmeContent)

  // tsconfig.json
  const tsconfigContent = require('./files-content/projections/tsconfigContent')
  const tsconfigPath = path.join('projections', 'tsconfig.json')
  fs.writeFileSync(tsconfigPath, tsconfigContent)

  // yarn.lock
  const yarnlockContent = require('./files-content/projections/yarnlockContent')
  const yarnlockPath = path.join('projections', 'yarn.lock')
  fs.writeFileSync(yarnlockPath, yarnlockContent)
}

module.exports = { createProjectionsRootFiles }
