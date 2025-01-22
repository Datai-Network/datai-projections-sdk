import { ADDRESS_ZERO, ensureUpdateTrigger, registerUser } from 'datai-sdk'
import { Transfer } from '../../generated/templates/Dsp/Dsp'
import { DodoUserPosition } from '../../generated/schema'

export function handleTransfer(event: Transfer): void {
  if (event.params.to.toHexString() == ADDRESS_ZERO) {
    return
  }

  // Ids
  const userId = event.params.to.toHexString()
  const dspId = event.address.toHexString()
  const positionId = userId + '-' + dspId

  // If trigger exists do nothing
  if (ensureUpdateTrigger(positionId, userId)) {
    return
  }

  // Protocol logic
  let dodoUserPosition = DodoUserPosition.load(positionId)
  if (dodoUserPosition == null) {
    dodoUserPosition = new DodoUserPosition(positionId)
    dodoUserPosition.user = userId
    dodoUserPosition.save()
  }

  // Register User
  registerUser(userId)
}
