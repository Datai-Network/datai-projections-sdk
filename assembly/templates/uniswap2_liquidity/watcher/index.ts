import { Address, BigInt } from '@graphprotocol/graph-ts'
import { Pair } from '../generated/templates/Pair/Pair'
import {
  activePositions,
  ActivePositionsResult,
  BI_0,
  bytesToAddress
} from 'datai-sdk'
import { Uniswap2Pool, Uniswap2UserPosition } from '../generated/schema'
import { getUnderlyingAmounts } from '../../../libs/uniswap2-lib'

export function GetActivePositions(): void {
  const uniswap2Position = activePositions.inputPosition<Uniswap2UserPosition>()
  const output = new ActivePositionsResult()

  const uniswap2UserPosition = Uniswap2UserPosition.load(uniswap2Position.id)
  if (uniswap2UserPosition == null) {
    console.error('Position is not registered!')
    throw new Error('Position' + uniswap2Position.id + 'is not registered!')
  }
  const userAddress = Address.fromString(uniswap2UserPosition.id.split('-')[0])
  const poolAddress = Address.fromString(uniswap2UserPosition.id.split('-')[1])
  const pool = Uniswap2Pool.load(poolAddress.toHexString())
  if (pool == null) {
    console.error('Pool is not registered!')
    throw new Error('Pool' + poolAddress.toHexString() + 'is not registered!')
  }

  const positionBalance = getPositionBalance(userAddress, poolAddress)
  const underlyingBalances = getUnderlyingAmounts(poolAddress, positionBalance)

  // Set results
  output.setSupplyBalance(bytesToAddress(pool.token0), underlyingBalances[0])
  output.setSupplyBalance(bytesToAddress(pool.token1), underlyingBalances[1])
  output.setPositionTokenBalance(poolAddress, positionBalance)
  output.poolAddress = poolAddress

  activePositions.output(output)
}

function getPositionBalance(user: Address, poolAddress: Address): BigInt {
  const poolContract = Pair.bind(poolAddress)
  const userBalance = poolContract.try_balanceOf(user)

  if (userBalance.reverted) {
    return BI_0
  }

  return userBalance.value
}
