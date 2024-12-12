module.exports = `# Build the project

\`yarn build uniswap2_liquidity uniswap2 liquidity_pool mainnet\`

# Build partly

\`yarn build uniswap2_liquidity uniswap2 liquidity_pool mainnet codegen\`
\`yarn build uniswap2_liquidity uniswap2 liquidity_pool mainnet graph\`
\`yarn build uniswap2_liquidity uniswap2 liquidity_pool mainnet watcher\`

# Build and deploy

\`yarn deploy uniswap2_liquidity uniswap2 liquidity_pool mainnet\` (devcontainer terminal)
or
\`docker compose run --rm --build projections deploy uniswap2_liquidity uniswap2 liquidity_pool mainnet\` in host terminal
`
