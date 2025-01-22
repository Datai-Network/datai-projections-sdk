import { SolidlyUserPosition } from '../../generated/schema'
import { Deposit } from '../../generated/templates/SolidlyGauge/SolidlyGauge'
import { ensureUpdateTrigger, registerUser } from 'datai-sdk'

export function handleDeposit(event: Deposit): void {
  // Ids
  const userId = event.params.from.toHexString()
  const positionId = userId + '-' + event.address.toHexString()

  // If trigger exists do nothing
  if (ensureUpdateTrigger(positionId, userId)) {
    return
  }

  // Protocol logic
  let solidlyUserPosition = SolidlyUserPosition.load(positionId)
  if (solidlyUserPosition == null) {
    solidlyUserPosition = new SolidlyUserPosition(positionId)
    solidlyUserPosition.user = userId
    solidlyUserPosition.save()
  }

  // Register User
  registerUser(userId)
}
