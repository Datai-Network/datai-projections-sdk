module.exports = `specVersion: 1.2.0
schema:
  file: ./schema.graphql
refs:
  - &refFactorySource
    kind: ethereum/contract
    source:
      abi: Factory
    mapping:
      kind: ethereum/events
      apiVersion: 0.0.7
      language: wasm/assemblyscript
      file: ./subgraph/mappings/factory.ts
      entities: []
      abis:
        - name: Factory
          file: ./abis/UniswapV2Factory.json
      eventHandlers:
        - event: PairCreated(indexed address,indexed address,address,uint256)
          handler: handleNewPair

  - &refPairSource
    kind: ethereum/contract
    source:
      abi: Pair
    mapping:
      kind: ethereum/events
      apiVersion: 0.0.7
      language: wasm/assemblyscript
      file: ./subgraph/mappings/pool.ts
      entities: []
      abis:
        - name: Pair
          file: ./abis/UniswapV2Pair.json
        - name: Factory
          file: ./abis/UniswapV2Factory.json
      eventHandlers:
        - event: Transfer(indexed address,indexed address,uint256)
          handler: handleTransfer
`
