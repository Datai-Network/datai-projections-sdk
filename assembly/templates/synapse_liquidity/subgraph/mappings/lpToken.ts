import { Transfer } from '../../generated/templates/LPToken/LPToken'
import { ensureUpdateTrigger, registerUser, ADDRESS_ZERO } from 'datai-sdk'
import { SynapseUserPosition } from '../../generated/schema'

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
  let angleUserPosition = SynapseUserPosition.load(positionId)
  if (angleUserPosition == null) {
    angleUserPosition = new SynapseUserPosition(positionId)
    angleUserPosition.user = userId
    angleUserPosition.save()
  }

  // Register User
  registerUser(userId)
}
