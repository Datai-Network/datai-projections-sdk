import { Address, BigInt } from '@graphprotocol/graph-ts'
import { Pair } from '../generated/templates/Pair/Pair'
import {
  activePositions,
  ActivePositionsResult,
  BI_0,
  bytesToAddress
} from 'datai-sdk'
import { SolidlyPool, SolidlyUserPosition } from '../generated/schema'
import { getUnderlyingAmounts } from '../../../libs/solidly-lib'

export function GetActivePositions(): void {
  const solidlyPosition = activePositions.inputPosition<SolidlyUserPosition>()
  const output = new ActivePositionsResult()

  const solidlyUserPosition = SolidlyUserPosition.load(solidlyPosition.id)
  if (solidlyUserPosition == null) {
    console.error('Position is not registered!')
    throw new Error('Position' + solidlyPosition.id + 'is not registered!')
  }
  const poolId = solidlyUserPosition.pool
  const userAddress = Address.fromString(solidlyUserPosition.user)
  const pool = SolidlyPool.load(poolId)
  if (pool == null) {
    console.error('Pool is not registered!')
    throw new Error('Pool' + poolId + 'is not registered!')
  }

  const positionBalance = getPositionBalance(
    userAddress,
    Address.fromString(poolId)
  )
  const underlyingBalances = getUnderlyingAmounts(
    Address.fromString(poolId),
    positionBalance
  )

  // Set results
  output.setSupplyBalance(bytesToAddress(pool.token0), underlyingBalances[0])
  output.setSupplyBalance(bytesToAddress(pool.token1), underlyingBalances[1])
  output.setPositionTokenBalance(Address.fromString(poolId), positionBalance)
  output.poolAddress = Address.fromString(poolId)

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
