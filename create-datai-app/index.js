#!/usr/bin/env node

const { createFolders } = require('./src/createFolders')
const { createRootFiles } = require('./src/createRootFiles')
const {
  createProjectionsRootFiles,
} = require('./src/createProjectionsRootFiles')
const { createDevContainerFiles } = require('./src/createDevContainerFiles')
const { createAssemblyRootFiles } = require('./src/createAssemblyRootFiles')
const { createUniswap2Files } = require('./src/createUniswap2Files')
const { createLibFiles } = require('./src/createLibFiles')
const { createTypescriptFiles } = require('./src/createTypescriptFiles')
const { createProtoFiles } = require('./src/createProtoFiles')
const { createGraphNodeFiles } = require('./src/createGraphNodeFiles')

// Create all folders
createFolders()

// Create all files in root directory
createRootFiles()

// Create all files in projections directory
createProjectionsRootFiles()

// Create all files in .devcontainers directory
createDevContainerFiles()

// Create all files in projections/assembly directory
createAssemblyRootFiles()

// Create all files related to uniswap2 (templates and protocol)
createUniswap2Files()

// Create all files in libs
createLibFiles()

// Create all typescript files
createTypescriptFiles()

// Create all proto files
createProtoFiles()

// Create graph-node config file
createGraphNodeFiles()
