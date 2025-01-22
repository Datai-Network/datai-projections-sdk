import { Address, BigInt } from '@graphprotocol/graph-ts'
import { Pair } from './templates/SolidlyPair'
import { BI_0 } from 'datai-sdk'

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
