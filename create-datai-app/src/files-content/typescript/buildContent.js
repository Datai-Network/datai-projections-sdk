module.exports = `
import asc from 'assemblyscript/asc'
import chalk from 'chalk'
import { execCommand, generateManifest } from './common.js'

const codegenCommand = (template: string): string =>
  \`graph codegen assembly/templates/\${template}/generated/subgraph.yaml -o assembly/templates/\${template}/generated --skip-migrations\`
const prettierGeneratedCommand = (template: string): string =>
  \`npx prettier assembly/templates/\${template}/generated/ --write\`
const eslintGeneratedCommand = (template: string): string =>
  \`npx eslint --fix assembly/templates/\${template}/generated/\`

const buildGraphCommand = (template: string): string =>
  \`graph build assembly/templates/\${template}/generated/subgraph.yaml -o assembly/templates/\${template}/.builds --skip-migrations\`

async function buildWatcher(template: string): Promise<void> {
  const { error, stdout, stderr } = await asc.main(
    [
      // Command line options
      'utils/pdk.ts', // includes builtin overrides
      \`../../assembly/templates/\${template}/watcher/index.ts\`,
      '--baseDir',
      'node_modules/datai-sdk',
      '--outFile',
      \`../../assembly/templates/\${template}/.builds/watcher.wasm\`,
      // "--optimize",
      '--debug',
      '--sourceMap',
      '--stats',
      '--runtime',
      'minimal',
      '--exportRuntime',
      '--initialMemory',
      '16',
      '--maximumMemory',
      '16',
      '--enable',
      'simd',
      '--enable',
      'reference-types',
      //'--exportTable',
      '--exportStart',
      '_start',
      '--use',
      'abort=utils/pdk/abortHandler',
      '--use',
      'console=utils/pdk/consoleHandler',
      '--bindings',
      'esm',
      '--disableWarning',
      '235' //Disable "Only variables, functions and enums become WebAssembly module exports." warning
    ],
    {
      // // Additional API options
      // stdout?: ...,
      // stderr?: ...,
      // readFile: (filename: string, baseDir: string) => {
      //   var filepath = path.join(baseDir, filename);
      //   if (existsSync(filepath)) {
      //     //console.log(filepath);
      //     return readFileSync(filepath, 'utf8');
      //   }
      //   return null;
      // },//  as (string | null) | Promise<string | null>,
      // writeFile?: ...,
      // listFiles?: ...,
      // reportDiagnostic?: ...,
      // transforms?: ...
    }
  )

  if (stderr) {
    console.error(stderr.toString())
  }

  console.log(stdout.toString())
  if (error) {
    throw error
  }
}

export async function main(
  templateArg: string,
  protocolArg: string,
  moduleArg: string,
  networkArg: string,
  buildStepsArg: string
): Promise<boolean> {
  // let isolate = false
  // if (buildStepsArg == 'isolate') {
  //   buildStepsArg = ''
  //   isolate = true
  // }
  if (!buildStepsArg) {
    buildStepsArg = 'codegen,graph,watcher'
  }

  const buildSteps = new Set(buildStepsArg.split(','))
  let step: string = ''

  try {
    step = 'manifest'
    await generateManifest(templateArg, protocolArg, moduleArg, networkArg)

    step = 'codegen'
    if (buildSteps.delete(step)) {
      await execCommand(codegenCommand(templateArg))
      //TODO: introduce automatic renaming parameters in ABI if they are reserved words like 'value' or 'result'
      await execCommand(eslintGeneratedCommand(templateArg))
      await execCommand(prettierGeneratedCommand(templateArg))
    }

    step = 'graph'
    if (buildSteps.delete(step)) {
      await execCommand(buildGraphCommand(templateArg))
    }

    step = 'watcher'
    if (buildSteps.delete(step)) {
      await buildWatcher(templateArg)
    }

    console.info(
      chalk.green(
        \`Build (\${buildStepsArg}) of projection \${protocolArg}.\${moduleArg} completed\`
      )
    )
  } catch (e) {
    buildSteps.clear()
    console.error(
      chalk.red(
        \`Build of projection \${protocolArg}.\${moduleArg} failed on step \${step}\`
      )
    )
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
    return false
  }

  if (buildSteps.size > 0) {
    console.error(
      chalk.yellow('Unexpected build steps ' + Array.from(buildSteps).join(','))
    )
  }

  return true
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
`
