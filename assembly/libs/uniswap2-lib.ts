import { Address, BigInt } from '@graphprotocol/graph-ts'
import { Pair } from './templates/UniswapV2Pair'
import { BI_0 } from 'datai-sdk'

export function isUniswap2(token: Address): bool {
  const poolContract = Pair.bind(token)

  const reserves = poolContract.try_getReserves()
  const token0 = poolContract.try_token0()

  if (!reserves.reverted && !token0.reverted) {
    return true
  } else {
    return false
  }
}

export function getUnderlyingTokens(poolAddress: Address): Array<Address> {
  const poolContract = Pair.bind(poolAddress)
  const token0 = poolContract.try_token0()
  const token1 = poolContract.try_token1()

  if (token0.reverted || token1.reverted) {
    return [poolAddress]
  }

  return [token0.value, token1.value]
}

export function getUnderlyingAmounts(
  poolAddress: Address,
  userBalance: BigInt
): Array<BigInt> {
  const poolContract = Pair.bind(poolAddress)
  const totalSupply = poolContract.try_totalSupply()
  const reserves = poolContract.try_getReserves()

  if (
    totalSupply.reverted ||
    reserves.reverted ||
    userBalance == BI_0 ||
    totalSupply.value == BI_0
  ) {
    return [BI_0, BI_0]
  }

  const balance0 = reserves.value
    .get_reserve0()
    .times(userBalance)
    .div(totalSupply.value)

  const balance1 = reserves.value
    .get_reserve1()
    .times(userBalance)
    .div(totalSupply.value)

  return [balance0, balance1]
}
