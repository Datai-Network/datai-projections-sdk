import { cp } from 'fs'
import { execAsync, generateManifest, ipfsUrl } from './common.js'
import chalk from 'chalk'
import { main as build } from './build.js'
import { execSync } from 'child_process'

const uploadGraphToIpfsCommand = (
  template: string,
  protocol: string,
  module: string,
  network: string
): string =>
  `graph deploy ${protocol}__${module}___${network} assembly/templates/${template}/generated/subgraph.yaml --version-label none -o assembly/templates/${template}/.builds --ipfs ${ipfsUrl} --node http://dummyNode`

const uploadGraphToIpfs = (
  template: string,
  protocol: string,
  module: string,
  network: string
): string => {
  const output = execSync(
    uploadGraphToIpfsCommand(template, protocol, module, network),
    {
      encoding: 'utf-8'
    }
  )

  // Extract the hash from the output using a regular expression
  const match = output.match(/Build completed: (\S+)/)
  if (match) {
    const response = match[1]
    return response
  } else {
    throw new Error('IPFS hash not found in the output.')
  }
}

const uploadArtifactToIpfsCommand = (
  template: string,
  artifact: string
): string =>
  `curl -X POST -F file=@assembly/templates/${template}/.builds/watcher.${artifact} ${ipfsUrl}/api/v0/add`

const uploadDeploymentResultsToIpfsCommand = (
  deploymentData: object
): string => {
  const jsonString = JSON.stringify(deploymentData, null, 2) // Pretty-print with spaces for readability
  return `echo '${jsonString}' | curl -X POST -F file=@- ${ipfsUrl}/api/v0/add`
}

const stripAnsi = (str: string): string => {
  // Regular expression to match ANSI escape codes
  return str.replace(
    /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g,
    ''
  )
}

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

async function uploadDeploymentDataToIpfs(
  protocol: string,
  module: string,
  network: string,
  subgraphIpfsHash: string,
  watcherIpfsHash: string
): Promise<void> {
  const deploymentData = {
    projection: `${protocol}__${module}___${network}`,
    subgraph: stripAnsi(subgraphIpfsHash),
    watcher: stripAnsi(watcherIpfsHash)
  }
  const { stdout } = await execAsync(
    uploadDeploymentResultsToIpfsCommand(deploymentData)
  )
  const jsonOutput = JSON.parse(stdout)
  const deploymentResultsIpfsHash = jsonOutput.Hash
  console.log(
    'Deployment Artifacts uploaded to IPFS with hash:',
    deploymentResultsIpfsHash
  )

  console.info(
    chalk.green(
      `\n✔ Deployment Submitted: To begin the indexing process, please stake your DATAI tokens using the deployment hash ${deploymentResultsIpfsHash} in the 'registerProjection' function on the Projection Registry contract.\n`
    )
  )
}

async function main(
  templateArg: string,
  protocolArg: string,
  moduleArg: string,
  networkArg: string
): Promise<void> {
  const deployStepsArg = 'graph,watcher'

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
      ''
    )
    if (!buildResult) {
      throw new Error('Build error')
    }

    let subgraphIpfsHash = ''
    let watcherIpfsHash = ''
    step = 'graph'
    if (deploySteps.delete(step)) {
      subgraphIpfsHash = uploadGraphToIpfs(
        templateArg,
        protocolArg,
        moduleArg,
        networkArg
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
      const { stdout } = await execAsync(
        uploadArtifactToIpfsCommand(templateArg, 'wasm')
      )

      const jsonOutput = JSON.parse(stdout)
      watcherIpfsHash = jsonOutput.Hash
    }

    console.info(
      chalk.green(
        `Deploy (${deployStepsArg}) of projection ${protocolArg}.${moduleArg} completed\n
        Subgraph IPFS Hash: ${subgraphIpfsHash} \n
        Watcher IPFS Hash: ${watcherIpfsHash}`
      )
    )

    uploadDeploymentDataToIpfs(
      protocolArg,
      moduleArg,
      networkArg,
      subgraphIpfsHash,
      watcherIpfsHash
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
  main(process.argv[2], process.argv[3], process.argv[4], process.argv[5])
}
