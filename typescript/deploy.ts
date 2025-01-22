import { cp } from 'fs'
import { execCommand, generateManifest } from './common.js'
import chalk from 'chalk'
import { main as build } from './build.js'

const createGraphCommand = (
  protocol: string,
  module: string,
  network: string
): string =>
  `graph create --node http://graph-node:8020 ${protocol}__${module}___${network}`

const deployGraphCommand = (
  template: string,
  protocol: string,
  module: string,
  network: string
): string =>
  `graph deploy ${protocol}__${module}___${network} assembly/templates/${template}/generated/subgraph.yaml --version-label none -o assembly/templates/${template}/.builds --ipfs http://ipfs:5001  --node http://graph-node:8020`

async function copyArtifact(
  template: string,
  protocol: string,
  module: string,
  network: string,
  artifact: string
): Promise<string> {
  return new Promise(
    (resolve: (value: string) => void, reject: (reason?: unknown) => void) => {
      const srcFile = `assembly/templates/${template}/.builds/watcher.${artifact}`
      const dstFile = `/deployments/${protocol}__${module}___${network}.${artifact}`

      cp(srcFile, dstFile, (err) => {
        if (err) {
          reject(err)
        }
        resolve(dstFile)
      })
    }
  )
}

async function main(
  templateArg: string,
  protocolArg: string,
  moduleArg: string,
  networkArg: string,
  deployStepsArg: string
): Promise<void> {
  // let isolate = false
  let allSteps = false
  // if (deployStepsArg == 'isolate') {
  //   deployStepsArg = ''
  //   isolate = true
  // }
  if (!deployStepsArg) {
    allSteps = true
    deployStepsArg = 'graph,watcher'
  }

  const deploySteps = new Set(deployStepsArg.split(','))
  let step: string = ''

  try {
    step = 'manifest'
    await generateManifest(templateArg, protocolArg, moduleArg, networkArg)

    step = 'build'
    const buildResult = await build(
      templateArg,
      protocolArg,
      moduleArg,
      networkArg,
      allSteps ? '' : deployStepsArg
      // isolate ? 'isolate' : allSteps ? '' : deployStepsArg
    )
    if (!buildResult) {
      throw new Error('Build error')
    }

    step = 'graph'
    if (deploySteps.delete(step)) {
      await execCommand(createGraphCommand(protocolArg, moduleArg, networkArg))
      await execCommand(
        deployGraphCommand(templateArg, protocolArg, moduleArg, networkArg)
      )
    }

    step = 'watcher'
    if (deploySteps.delete(step)) {
      await copyArtifact(
        templateArg,
        protocolArg,
        moduleArg,
        networkArg,
        'wasm'
      )
      await copyArtifact(
        templateArg,
        protocolArg,
        moduleArg,
        networkArg,
        'wasm.map'
      )
      await copyArtifact(templateArg, protocolArg, moduleArg, networkArg, 'js')
    }

    console.info(
      chalk.green(
        `Deploy (${deployStepsArg}) of projection ${protocolArg}.${moduleArg} completed`
      )
    )
  } catch (e) {
    deploySteps.clear()
    console.error(
      chalk.red(
        `Deploy of projection ${protocolArg}.${moduleArg} failed on step ${step}`
      )
    )
    if (step == 'graph') {
      console.warn(
        chalk.yellow(
          'Ensure that graph-node and ipfs containers are working: \
          `docker-compose up -d graph-node ipfs` outside of devcontainer'
        )
      )
    }

    if (e instanceof Error) {
      if ('stderr' in e) {
        console.error(e.stderr)
      }
      if ('stdout' in e) {
        console.error(e.stdout)
      }
      if ('message' in e) {
        console.error(e.message)
      }
    } else {
      console.error(e)
    }
  }

  if (deploySteps.size > 0) {
    console.error(
      chalk.red('Unexpected deploy steps ' + Array.from(deploySteps).join(','))
    )
  }
}

if (process.argv[1] == import.meta.filename) {
  main(
    process.argv[2],
    process.argv[3],
    process.argv[4],
    process.argv[5],
    process.argv[6]
  )
}
