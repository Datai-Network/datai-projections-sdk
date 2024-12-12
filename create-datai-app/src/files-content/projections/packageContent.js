module.exports = `{
  "name": "projections",
  "version": "1.0.0",
  "esModuleInterop": true,
  "main": "typescript/build.ts",
  "license": "MIT",
  "type": "module",
  "scripts": {
    "build": "node --import ./typescript/ts-node.register.mjs typescript/build.ts",
    "build-proto": "node --import ./typescript/ts-node.register.mjs typescript/buildProto.ts",
    "deploy": "node --import ./typescript/ts-node.register.mjs typescript/deploy.ts",
    "submit": "node --import ./typescript/ts-node.register.mjs typescript/submit.ts",
    "deployFromIpfs": "node --import ./typescript/ts-node.register.mjs typescript/deployFromIpfs.ts",
    "delete": "npx graph remove --node http://graph-node:8020",
    "prettify": "npx eslint --fix assembly && npx prettier assembly"
  },
  "devDependencies": {
    "@eslint/js": "^9.1.1",
    "@graphprotocol/graph-cli": "^0.71.1",
    "@types/js-yaml": "4.0.9",
    "@types/lodash": "4.17.7",
    "@types/node": "^20.12.3",
    "as-proto-gen": "^1.3.0",
    "chalk": "^5.3.0",
    "eslint": "^9.1.1",
    "eslint-config-prettier": "^9.1.0",
    "eslint-plugin-unused-imports": "^3.1.0",
    "prettier": "^3.2.5",
    "ts-node": "^10.9.2",
    "typescript": "^5.4.5",
    "typescript-eslint": "^7.7.1"
  },
  "dependencies": {
    "@extism/as-pdk": "^1.0.0",
    "@graphprotocol/graph-ts": "^0.34.0",
    "as-proto": "^1.3.0",
    "assemblyscript": "^0.27.26",
    "js-yaml": "^4.1.0",
    "lodash": "^4.17.21",
    "yaml": "^2.4.2",
    "datai-sdk": "^1.0.2"
  }
}`
