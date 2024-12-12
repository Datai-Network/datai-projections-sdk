module.exports = `import { execCommand, execAsync } from './common.js'
import chalk from 'chalk'

interface DeploymentData {
  projection: string
  subgraph: string
  watcher: string
}

const ipfsUrl = 'http://ipfs:5001'

const createGraphCommand = (projection: string): string =>
  \`graph create --node http://graph-node:8020 \${projection}\`

const deployFromIpfsCommand = (
  projection: string,
  subgraphIpfsHash: string
): string =>
  \`graph deploy \${projection} --ipfs \${ipfsUrl} --ipfs-hash \${subgraphIpfsHash}  --version-label none --node http://graph-node:8020\`

async function loadDeploymentDataFromIpfs(
  ipfsHash: string
): Promise<DeploymentData> {
  try {
    const cmd = \`curl -X POST "\${ipfsUrl}/api/v0/cat?arg=\${ipfsHash}"\`
    const { stdout } = await execAsync(cmd)
    const data = JSON.parse(stdout) as DeploymentData
    return data
  } catch (error) {
    console.error('Error fetching or parsing JSON from IPFS:', error)
    throw new Error('Error fetching or parsing JSON from IPFS')
  }
}

async function main(ipfs: string, deployStepsArg: string): Promise<void> {
  if (!deployStepsArg) {
    deployStepsArg = 'graph'
  }

  const data = await loadDeploymentDataFromIpfs(ipfs)
  const projection = data.projection
  const subgraphIpfsHash = data.subgraph

  console.info(
    \`Start Deploying Projection: \${projection}, subgraph ipfs Hash: \${subgraphIpfsHash}\`
  )

  const deploySteps = new Set(deployStepsArg.split(','))
  let step: string = ''

  try {
    step = 'graph'
    if (deploySteps.delete(step)) {
      await execCommand(createGraphCommand(projection))
      await execCommand(deployFromIpfsCommand(projection, subgraphIpfsHash))
    }

    console.info(
      chalk.green(
        \`Deploy (\${deployStepsArg}) of projection \${projection} completed\`
      )
    )
  } catch (e) {
    deploySteps.clear()
    console.error(
      chalk.red(\`Deploy of projection \${projection} failed on step \${step}\`)
    )
    if (step == 'graph') {
      console.warn(
        chalk.yellow(
          'Ensure that graph-node and ipfs containers are working: \
          \`docker-compose up -d graph-node ipfs\` outside of devcontainer'
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
  main(process.argv[2], process.argv[3])
}
`
