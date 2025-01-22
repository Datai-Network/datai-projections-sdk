import { Deposit } from '../../generated/templates/Vault/Vault'
import { ensureUpdateTrigger, registerUser } from 'datai-sdk'
import { IchiUserPosition } from '../../generated/schema'

export function handleDeposit(event: Deposit): void {
  // Ids
  const userId = event.params.to.toHexString()
  const poolId = event.address.toHexString()
  const positionId = userId + '-' + poolId

  // If trigger exists do nothing
  if (ensureUpdateTrigger(positionId, userId)) {
    return
  }

  // Protocol logic
  let ichiUserPosition = IchiUserPosition.load(positionId)
  if (ichiUserPosition == null) {
    ichiUserPosition = new IchiUserPosition(positionId)
    ichiUserPosition.user = userId
    ichiUserPosition.save()
  }

  // Register User
  registerUser(userId)
}
