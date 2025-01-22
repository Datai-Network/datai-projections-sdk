import { ensureUpdateTrigger, registerUser, ADDRESS_ZERO } from 'datai-sdk'
import { PoolTogether4UserPosition } from '../../generated/schema'
import { Transfer } from '../../generated/templates/PrizeVault/PrizeVault'

export function handleTransfer(event: Transfer): void {
  if (event.params.to.toHexString() == ADDRESS_ZERO) {
    return
  }

  // Ids
  const userId = event.params.to.toHexString()
  const positionId = userId + '-' + event.address.toHexString()

  // If trigger exists do nothing
  if (ensureUpdateTrigger(positionId, userId)) {
    return
  }

  // Protocol logic
  let poolTogetherUserPosition = PoolTogether4UserPosition.load(positionId)
  if (poolTogetherUserPosition == null) {
    poolTogetherUserPosition = new PoolTogether4UserPosition(positionId)
    poolTogetherUserPosition.user = userId
    poolTogetherUserPosition.save()
  }

  // Register User
  registerUser(userId)
}
