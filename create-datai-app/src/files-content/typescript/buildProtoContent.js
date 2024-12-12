module.exports = `import { execCommand } from './common.js'

const protobufCommand = (): string =>
  'protoc \
    --plugin=protoc-gen-as=./node_modules/.bin/as-proto-gen \
    --as_opt=gen-helper-methods \
    --as_out=assembly/.build/proto/ \
    --proto_path=/workspace/API/v1 \
    store.proto ethereum.proto activePositions.proto bigDecimal.proto watcher.proto'
const prettierProtobufCommand = (): string =>
  'npx prettier assembly/.build/proto/ --write'
const eslintProtobufCommand = (): string =>
  'npx eslint --fix assembly/.build/proto/'

await execCommand(protobufCommand())
await execCommand(eslintProtobufCommand())
await execCommand(prettierProtobufCommand())
`
