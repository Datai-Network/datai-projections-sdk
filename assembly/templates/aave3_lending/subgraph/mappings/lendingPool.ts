import { Address, log } from '@graphprotocol/graph-ts'

import {
  Borrow,
  Supply
} from '../../generated/templates/LendingPool/LendingPool'
import { LendingPool } from '../../generated/templates/LendingPool/LendingPool'

import {
  AavePool,
  AaveReserves,
  AaveUserPosition
} from '../../generated/schema'
import { registerUser, ensureUpdateTrigger, ADDRESS_ZERO } from 'datai-sdk'

export function handleSupply(event: Supply): void {
  // Ids
  const userId = event.params.onBehalfOf.toHexString()
  const tokenAddress = event.params.reserve //underlying asset
  const poolAddress = event.address

  registerEntities(userId, tokenAddress, poolAddress, '0')
}

export function handleBorrow(event: Borrow): void {
  // Ids
  const userId = event.params.onBehalfOf.toHexString()
  const tokenAddress = event.params.reserve //underlying asset
  const poolAddress = event.address
  registerEntities(
    userId,
    tokenAddress,
    poolAddress,
    '1',
    event.params.interestRateMode
  )
}

function registerEntities(
  userId: string,
  tokenAddress: Address,
  poolAddress: Address,
  positionType: string,
  borrowMode: number = 0
): void {
  const tokenId = tokenAddress.toHexString()
  const poolId = poolAddress.toHexString()
  let positionId = userId + '-' + poolId + '-' + tokenId + '-' + positionType
  // If trigger exists do nothing
  if (ensureUpdateTrigger(positionId, userId)) {
    return
  }

  const pool = AavePool.load(poolId)
  if (pool == null) {
    log.error('Pool {} is not registered!', [poolId])
    throw new Error('Pool' + poolId + 'is not registered!')
  }
  let aaveReserves = AaveReserves.load(userId + '-' + poolId + '-' + tokenId)
  if (aaveReserves == null) {
    const lendingPool = LendingPool.bind(poolAddress)
    const reservesResponse = lendingPool.getReserveData(tokenAddress)
    aaveReserves = new AaveReserves(userId + '-' + poolId + '-' + tokenId)
    aaveReserves.poolId = poolAddress
    aaveReserves.underlying = tokenAddress
    aaveReserves.aToken = reservesResponse.aTokenAddress
    aaveReserves.sToken = reservesResponse.stableDebtTokenAddress
    aaveReserves.vToken = reservesResponse.variableDebtTokenAddress
    aaveReserves.save()
  }
  let aaveUserPosition = AaveUserPosition.load(positionId)
  if (aaveUserPosition == null) {
    aaveUserPosition = new AaveUserPosition(positionId)
    aaveUserPosition.user = userId
    aaveUserPosition.pool = poolId
    aaveUserPosition.underlyingToken = tokenAddress
    if (positionType == '0') {
      aaveUserPosition.internalToken = aaveReserves.aToken
    } else if (borrowMode == 1) {
      aaveUserPosition.internalToken = aaveReserves.sToken
    } else {
      aaveUserPosition.internalToken = aaveReserves.vToken
    }
    aaveUserPosition.save()
  }

  // Rewards position
  positionId = userId + '-' + poolId + '-' + ADDRESS_ZERO + '-' + '2'

  // If trigger exists do nothing
  if (ensureUpdateTrigger(positionId, userId)) {
    return
  }

  aaveUserPosition = AaveUserPosition.load(positionId)
  if (aaveUserPosition == null) {
    aaveUserPosition = new AaveUserPosition(positionId)
    aaveUserPosition.user = userId
    aaveUserPosition.pool = poolId
    aaveUserPosition.underlyingToken = Address.fromString(ADDRESS_ZERO)
    aaveUserPosition.internalToken = Address.fromString(ADDRESS_ZERO)
    aaveUserPosition.save()
  }

  // Register User
  registerUser(userId)
}
