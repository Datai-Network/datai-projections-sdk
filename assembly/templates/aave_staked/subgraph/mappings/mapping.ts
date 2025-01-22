import { ensureUpdateTrigger, registerUser } from 'datai-sdk'
import { Staked } from '../../generated/StakedToken0/StakedToken'
import { AaveStakedUserPosition } from '../../generated/schema'

export function handleStaked(event: Staked): void {
  // Ids
  const userId = event.params.to.toHexString()
  const tokenId = event.address.toHexString()
  const positionId = userId + '-' + tokenId

  // If trigger exists do nothing
  if (ensureUpdateTrigger(positionId, userId)) {
    return
  }

  // Protocol logic
  let userPosition = AaveStakedUserPosition.load(positionId)
  if (userPosition == null) {
    userPosition = new AaveStakedUserPosition(positionId)
    userPosition.user = userId

    userPosition.save()
  }

  // Register User
  registerUser(userId)
}
