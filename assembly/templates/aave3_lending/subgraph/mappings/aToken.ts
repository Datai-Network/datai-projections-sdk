import { Address, log } from '@graphprotocol/graph-ts'
import { BalanceTransfer } from '../../generated/templates/AToken/AToken'
import { AToken } from '../../generated/templates/AToken/AToken'
import { AavePool, AaveUserPosition } from '../../generated/schema'
import { registerUser, ensureUpdateTrigger, ADDRESS_ZERO } from 'datai-sdk'

export function handleATokenTransfer(event: BalanceTransfer): void {
  // Contract instances
  const aToken = AToken.bind(event.address)

  // Ids
  const userId = event.params.to.toHexString()
  const tokenAddress = aToken.UNDERLYING_ASSET_ADDRESS()
  const tokenId = tokenAddress.toHexString()
  const poolId = aToken.POOL().toHexString()
  let positionId = userId + '-' + poolId + '-' + tokenId + '-' + '0'

  // If trigger exists do nothing
  if (ensureUpdateTrigger(positionId, userId)) {
    return
  }

  // Protocol logic
  const pool = AavePool.load(poolId)
  if (pool == null) {
    log.error('Pool {} is not registered!', [poolId])
    throw new Error('Pool' + poolId + 'is not registered!')
  }

  let aaveUserPosition = AaveUserPosition.load(positionId)
  if (aaveUserPosition == null) {
    aaveUserPosition = new AaveUserPosition(positionId)
    aaveUserPosition.user = userId
    aaveUserPosition.pool = poolId
    aaveUserPosition.underlyingToken = tokenAddress
    aaveUserPosition.internalToken = event.address
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
