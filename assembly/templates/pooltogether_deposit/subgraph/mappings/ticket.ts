import { ensureUpdateTrigger, registerUser } from 'datai-sdk'
import { PoolTogetherUserPosition } from '../../generated/schema'
import { Transfer } from '../../generated/templates/Ticket/Ticket'

export function handleTransfer(event: Transfer): void {
  // Ids
  const userId = event.params.to.toHexString()
  const positionId = userId + '-' + event.address.toHexString()

  // If trigger exists do nothing
  if (ensureUpdateTrigger(positionId, userId)) {
    return
  }

  // Protocol logic
  let poolTogetherUserPosition = PoolTogetherUserPosition.load(positionId)
  if (poolTogetherUserPosition == null) {
    poolTogetherUserPosition = new PoolTogetherUserPosition(positionId)
    poolTogetherUserPosition.user = userId
    poolTogetherUserPosition.save()
  }

  // Register User
  registerUser(userId)
}
