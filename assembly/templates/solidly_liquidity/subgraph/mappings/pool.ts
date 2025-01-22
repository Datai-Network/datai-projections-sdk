import { Transfer } from '../../generated/templates/Pair/Pair'
import { ensureUpdateTrigger, registerUser, ADDRESS_ZERO } from 'datai-sdk'
import { SolidlyPool, SolidlyUserPosition } from '../../generated/schema'
import { log } from '@graphprotocol/graph-ts'

export function handleTransfer(event: Transfer): void {
  if (
    event.params.to.toHexString() == ADDRESS_ZERO ||
    event.params.to == event.address
  ) {
    return
  }

  // Ids
  const userId = event.params.to.toHexString()
  const poolId = event.address.toHexString()
  const positionId = userId + '-' + poolId

  // If trigger exists do nothing
  if (ensureUpdateTrigger(positionId, userId)) {
    return
  }

  // Protocol logic
  const pool = SolidlyPool.load(poolId)
  if (pool == null) {
    log.error('Pool {} is not registered!', [poolId])
    throw new Error('Pool' + poolId + 'is not registered!')
  }

  let solidlyUserPosition = SolidlyUserPosition.load(positionId)
  if (solidlyUserPosition == null) {
    solidlyUserPosition = new SolidlyUserPosition(positionId)
    solidlyUserPosition.pool = poolId
    solidlyUserPosition.user = userId
    solidlyUserPosition.save()
  }

  // Register User
  registerUser(userId)
}
