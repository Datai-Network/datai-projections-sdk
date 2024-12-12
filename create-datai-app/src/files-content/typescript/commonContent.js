module.exports = `import { exec } from 'child_process'
import util from 'node:util'
import {
  readFile,
  writeFile,
  mkdir,
  existsSync,
  readFileSync,
  writeFileSync,
  mkdirSync
} from 'fs'
import { resolve, relative } from 'path'
// import YAML from 'yaml'
// const yaml = require('js-yaml')
// const _ = require('lodash')
import yaml from 'js-yaml'
import _ from 'lodash'

export const execAsync = util.promisify(exec)
export const readFileAsync = util.promisify(readFile)
export const writeFileAsync = util.promisify(writeFile)
export const mkdirAsync = util.promisify(mkdir)

export async function execCommand(command: string): Promise<void> {
  const { stdout, stderr } = await execAsync(command)
  console.error(stderr)
  console.log(stdout)
}

interface Manifest {
  schema: WithFile
  templates?: DataSource[]
  refs?: unknown
  dataSources: DataSource[]
  isolate?: unknown[]
}

interface WithFile {
  file: string
}

interface DataSource {
  mapping: Mapping
}

interface Mapping extends WithFile {
  abis: WithFile[]
  eventHandlers: EventHandler[]
}

interface EventHandler {
  topic1?: string[]
  topic2?: string[]
  topic3?: string[]
}

async function isolateWallets(
  manifest: Manifest,
  applyIsolate: boolean
): Promise<void> {
  const isolate = manifest.isolate || []
  delete manifest.isolate
  if (!Array.isArray(isolate)) {
    throw new Error('Incorrect isolate file schema')
  }

  function isolateEventHandler(eventHandler: EventHandler): EventHandler[] {
    const { topic1, topic2, topic3, ...rest } = eventHandler
    const resultBase: EventHandler = rest
    const resultExt = []

    // same JS objects mean using same anchor targets
    // make fileting like topic1 == anchor || topic2 == anchor || topic3 == anchor
    // with replication of the event handler

    if (isolate.includes(topic1)) {
      if (topic1 == topic2 || topic1 == topic3) {
        resultExt.push({ topic1 })
      } else if (applyIsolate) {
        resultBase.topic1 = topic1
      }
    } else {
      resultBase.topic1 = topic1
    }

    if (isolate.includes(topic2)) {
      if (topic2 == topic1 || topic2 == topic3) {
        resultExt.push({ topic2 })
      } else if (applyIsolate) {
        resultBase.topic2 = topic2
      }
    } else {
      resultBase.topic2 = topic2
    }

    if (isolate.includes(topic3)) {
      if (topic3 == topic1 || topic3 == topic2) {
        resultExt.push({ topic3 })
      } else if (applyIsolate) {
        resultBase.topic3 = topic3
      }
    } else {
      resultBase.topic3 = topic3
    }

    if (resultExt.length == 0 || !applyIsolate) {
      return [resultBase]
    }

    return resultExt.map((ext) => ({ ...resultBase, ...ext }))
  }

  manifest.dataSources
    .concat(manifest.templates || [])
    .forEach((dataSource) => {
      dataSource.mapping.eventHandlers =
        dataSource.mapping.eventHandlers.flatMap(isolateEventHandler)
    })
}

function rebase(manifest: Manifest, sourceDir: string, destDir: string): void {
  function rebaseNode(node: WithFile): void {
    const oldRelative = node.file

    const absolute = resolve(sourceDir, oldRelative)
    const newRelative = relative(resolve(destDir, '.'), absolute)

    node.file = newRelative
  }

  rebaseNode(manifest.schema)

  manifest.dataSources.forEach((dataSource, index) => {
    // Create a shallow copy of the mapping object to avoid shared references
    const independentMapping = {
      ...dataSource.mapping,
      abis: dataSource.mapping.abis.map((abi) => ({ ...abi }))
    }
    rebaseNode(independentMapping)
    independentMapping.abis.forEach(rebaseNode)

    // Update the dataSource with the independent mapping
    manifest.dataSources[index].mapping = independentMapping
  })

  if (manifest.templates) {
    manifest.templates.forEach((template, index) => {
      // Create a shallow copy of the mapping object to avoid shared references
      const independentMapping = {
        ...template.mapping,
        abis: template.mapping.abis.map((abi) => ({ ...abi }))
      }
      rebaseNode(independentMapping)
      independentMapping.abis.forEach(rebaseNode)

      // Update the Template with the independent mapping
      manifest.templates![index].mapping = independentMapping
    })
  }
}

export async function generateManifest(
  template: string,
  protocol: string,
  module: string,
  network: string
): Promise<void> {
  const sourceTemplateDir = resolve('assembly', 'templates', template)
  const sourceConfigDir = resolve(
    'assembly',
    'protocols',
    \`\${protocol}.\${module}\`,
    network
  )
  const destDir = resolve(sourceTemplateDir, 'generated')
  const destFileName = resolve(destDir, 'subgraph.yaml')
  const sourceTemplateFileName = resolve(sourceTemplateDir, 'subgraph.yaml')
  const sourceConfigFileName = resolve(sourceConfigDir, \`\${template}.yaml\`)

  const sourceTemplateText = readFileSync(sourceTemplateFileName, 'utf8')
  const sourceConfigText = readFileSync(sourceConfigFileName, 'utf8')

  const mergedText = sourceTemplateText + sourceConfigText

  const manifest = yaml.load(mergedText) as Manifest
  delete manifest.refs

  rebase(manifest, sourceTemplateDir, destDir)

  const destText = yaml.dump(manifest)

  mkdirSync(destDir, { recursive: true })
  writeFileSync(destFileName, destText)
}

// export async function generateManifest(
//   projection: string,
//   isolate: boolean
// ): Promise<void> {
//   const sourceDir = resolve('assembly', projection)
//   const destDir = resolve(sourceDir, 'generated')
//   const destFilename = resolve(destDir, 'subgraph.yaml')

//   const sourceFilenames = [resolve(sourceDir, 'subgraph.yaml')]

//   const isolateFilename = resolve(sourceDir, 'isolate.yaml')
//   if (existsSync(isolateFilename)) {
//     sourceFilenames.unshift(isolateFilename)
//   } else if (isolate) {
//     throw new Error(
//       'isolate.yaml file is not found. Either create it or disable "isolate" option'
//     )
//   }

//   const sourceTexts = await Promise.all(
//     sourceFilenames.map((sourceFilename) =>
//       readFileAsync(sourceFilename, 'utf8')
//     )
//   )

//   const doc = YAML.parseDocument(sourceTexts.join('\\n'))
//   for (const error of doc.errors) {
//     console.log(error)
//   }

//   //YAML.parse(sourceTexts.join('\\n'))
//   const manifest = doc.toJS() as Manifest
//   await isolateWallets(manifest, isolate)

//   rebase(manifest, sourceDir, destDir)

//   await mkdirAsync(destDir, { recursive: true })
//   const destText = YAML.stringify(manifest, { aliasDuplicateObjects: false })
//   await writeFileAsync(destFilename, destText)
// }
`
