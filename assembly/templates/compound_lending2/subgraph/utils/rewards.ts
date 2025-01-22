import { Address } from '@graphprotocol/graph-ts'

export const rewardsMap = new Map<string, Address>()
// Mainnet USDC
rewardsMap.set(
  '0xc3d688b66703497daa19211eedff47f25384cdc3',
  Address.fromString('0x1B0e765F6224C21223AeA2af16c1C46E38885a40')
)
// Mainnet WETH
rewardsMap.set(
  '0xa17581a9e3356d9a858b789d68b4d866e593ae94',
  Address.fromString('0x1B0e765F6224C21223AeA2af16c1C46E38885a40')
)
// Polygon USDC
rewardsMap.set(
  '0xf25212e676d1f7f89cd72ffee66158f541246445',
  Address.fromString('0x45939657d1CA34A8FA39A924B71D28Fe8431e581')
)
// Optimism USDC
rewardsMap.set(
  '0x2e44e174f7d53f0212823acc11c01a11d58c5bcb',
  Address.fromString('0x443EA0340cb75a160F31A440722dec7b5bc3C2E9')
)
// Base USDC
rewardsMap.set(
  '0xb125e6687d4313864e53df431d5425969c15eb2f',
  Address.fromString('0x123964802e6ABabBE1Bc9547D72Ef1B69B00A6b1')
)
// Base USDCbC
rewardsMap.set(
  '0x9c4ec768c28520b50860ea7a15bd7213a9ff58bf',
  Address.fromString('0x123964802e6ABabBE1Bc9547D72Ef1B69B00A6b1')
)
// Base WETH
rewardsMap.set(
  '0x46e6b214b524310239732d51387075e0e70970bf',
  Address.fromString('0x123964802e6ABabBE1Bc9547D72Ef1B69B00A6b1')
)
