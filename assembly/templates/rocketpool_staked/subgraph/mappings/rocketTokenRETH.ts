import { Transfer } from '../../generated/RocketpoolRocketTokenRETH/RocketTokenRETH'
import { ensureUpdateTrigger, registerUser, ADDRESS_ZERO } from 'datai-sdk'
import { RocketpoolUserPosition } from '../../generated/schema'

export function handleTransfer(event: Transfer): void {
  if (event.params.to.toHexString() == ADDRESS_ZERO) {
    return
  }

  // Ids
  const userId = event.params.to.toHexString()
  const positionId = userId + '-' + event.address.toHexString() + '-0'

  // If trigger exists do nothing
  if (ensureUpdateTrigger(positionId, userId)) {
    return
  }

  // Protocol logic
  let rocketpoolUserPosition = RocketpoolUserPosition.load(positionId)
  if (rocketpoolUserPosition == null) {
    rocketpoolUserPosition = new RocketpoolUserPosition(positionId)
    rocketpoolUserPosition.user = userId
    rocketpoolUserPosition.save()
  }

  // Register User
  registerUser(userId)
}
