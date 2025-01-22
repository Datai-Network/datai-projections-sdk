import { Transfer } from '../../generated/mEth/mEth'
import { ensureUpdateTrigger, registerUser, ADDRESS_ZERO } from 'datai-sdk'
import { MantleUserPosition } from '../../generated/schema'

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
  let mantleUserPosition = MantleUserPosition.load(positionId)
  if (mantleUserPosition == null) {
    mantleUserPosition = new MantleUserPosition(positionId)
    mantleUserPosition.user = userId
    mantleUserPosition.save()
  }

  // Register User
  registerUser(userId)
}
