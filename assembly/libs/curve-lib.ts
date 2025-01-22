import { Address, BigInt } from '@graphprotocol/graph-ts'
import { CurveRegistryAddressProvider } from './templates/CurveRegistryAddressProvider'
import { CurveMetaRegistry } from './templates/CurveMetaRegistry'
import { ERC20 } from './templates/ERC20'
import { BI_0, BI_7 } from 'datai-sdk'
import { CurveRegistry } from './templates/CurveRegistry'
import { CurveStableSwap } from './templates/CurveStableSwap'
import { CurveLP } from './templates/CurveLP'

const registryAddressProviderAddress = Address.fromString(
  '0x0000000022d53366457f9d5e68ec105046fc4383'
)

export function getMetaRegistryAddress(): Address {
  const registryAddressProvider = CurveRegistryAddressProvider.bind(
    registryAddressProviderAddress
  )

  const metaRegistryCall = registryAddressProvider.try_get_address(BI_7)

  if (metaRegistryCall.reverted) {
    return Address.zero()
  }

  return metaRegistryCall.value
}

export function getRegistryAddress(): Address {
  const registryAddressProvider = CurveRegistryAddressProvider.bind(
    registryAddressProviderAddress
  )

  const registry = registryAddressProvider.try_get_registry()

  if (registry.reverted) {
    return Address.zero()
  }

  return registry.value
}

export function isCurve(token: Address): bool {
  const metaRegistryAddress = getMetaRegistryAddress()
  const metaRegistry = CurveMetaRegistry.bind(metaRegistryAddress)

  const pool = metaRegistry.try_get_pool_from_lp_token(token)

  if (!pool.reverted) {
    if (pool.value == Address.zero()) {
      return false
    } else {
      return true
    }
  }

  // Meta-registry still not created
  const registryAddress = getRegistryAddress()
  const registry = CurveRegistry.bind(registryAddress)
  let poolAddress = registry.try_get_pool_from_lp_token(token)

  if (!poolAddress.reverted && poolAddress.value != Address.zero()) {
    return true
  }

  const stableSwap = CurveStableSwap.bind(token)

  const coin0 = stableSwap.try_coins(BI_0)

  if (!coin0.reverted) {
    return true
  }

  const lpContract = CurveLP.bind(token)
  poolAddress = lpContract.try_minter()

  if (!poolAddress.reverted) {
    return true
  }

  return false
}

export function getUnderlyingAmounts(
  lpAddress: Address,
  lpAmount: BigInt
): Array<BigInt> {
  const totalSupply = getTotalSupply(lpAddress)

  if (totalSupply == BI_0) {
    return [lpAmount]
  }

  const metaRegistryAddress = getMetaRegistryAddress()
  const metaRegistry = CurveMetaRegistry.bind(metaRegistryAddress)

  const poolAddressCall = metaRegistry.try_get_pool_from_lp_token(lpAddress)

  if (poolAddressCall.reverted || poolAddressCall.value == Address.zero()) {
    return [lpAmount]
  }

  const balancesCall = metaRegistry.try_get_underlying_balances(
    poolAddressCall.value
  )

  if (balancesCall.reverted) {
    return [lpAmount]
  }

  const balances = new Array<BigInt>()

  for (let i = 0; i < balancesCall.value.length; i++) {
    balances.push(balancesCall.value[i].times(lpAmount).div(totalSupply))
  }

  return balances
}

export function getUnderlyingCoins(lpAddress: Address): Array<Address> {
  const metaRegistryAddress = getMetaRegistryAddress()
  const metaRegistry = CurveMetaRegistry.bind(metaRegistryAddress)

  const poolAddressCall = metaRegistry.try_get_pool_from_lp_token(lpAddress)

  if (poolAddressCall.reverted) {
    return getUnderlyingCoinsOldBlock(lpAddress)
  }

  if (poolAddressCall.value == Address.zero()) {
    return [lpAddress]
  }

  const coinsCall = metaRegistry.try_get_underlying_coins(poolAddressCall.value)

  if (coinsCall.reverted) {
    return [lpAddress]
  }

  return coinsCall.value
}

function getUnderlyingCoinsOldBlock(lpAddress: Address): Array<Address> {
  const coins = new Array<Address>()

  const registryAddress = getRegistryAddress()
  const registry = CurveRegistry.bind(registryAddress)
  const poolAddress = registry.try_get_pool_from_lp_token(lpAddress)

  if (poolAddress.reverted || poolAddress.value == Address.zero()) {
    // Pools which are not in the Curve Registry
    return _getFactoryUnderlyingCoinsOldBlock(lpAddress, coins)
  }

  const coinsCall = registry.try_get_underlying_coins(poolAddress.value)
  if (!coinsCall.reverted) {
    return coinsCall.value.filter((item) => item != Address.zero())
  }

  return coins
}

// Curve Factory balances (from non-registered pools)
function _getFactoryUnderlyingCoinsOldBlock(
  lpAddress: Address,
  coins: Array<Address>
): Array<Address> {
  let stableSwap = CurveStableSwap.bind(lpAddress)

  let coin0Call = stableSwap.try_coins(BI_0)
  if (coin0Call.reverted) {
    const lpContract = CurveLP.bind(lpAddress)
    const poolAddressCall = lpContract.try_minter()

    // It's probably an underlying
    if (poolAddressCall.reverted) {
      return [lpAddress]
    }

    stableSwap = CurveStableSwap.bind(poolAddressCall.value)
    coin0Call = stableSwap.try_coins(BI_0)

    if (coin0Call.reverted) {
      return [lpAddress]
    }
  }

  coins.push(coin0Call.value)

  for (let i = 1; i < 7; i++) {
    const coinCall = stableSwap.try_coins(BigInt.fromI32(i))
    if (coinCall.reverted) {
      break
    }

    // Check if this is another LP
    const underlyingCoins = getUnderlyingCoins(coinCall.value)
    coins = coins.concat(underlyingCoins)
  }

  return coins
}

function getTotalSupply(tokenAddress: Address): BigInt {
  const erc20 = ERC20.bind(tokenAddress)
  const totalSupply = erc20.try_totalSupply()
  return totalSupply.reverted ? BI_0 : totalSupply.value
}
