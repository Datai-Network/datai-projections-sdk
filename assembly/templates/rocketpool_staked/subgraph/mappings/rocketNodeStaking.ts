import {
  RPLStaked,
  RPLTransferred
} from '../../generated/RocketNodeStaking/RocketNodeStaking'
import { ensureUpdateTrigger, registerUser } from 'datai-sdk'
import { RocketpoolUserPosition } from '../../generated/schema'

export function handleStaked(event: RPLStaked): void {
  // Ids
  const userId = event.params.from.toHexString()
  const positionId = userId + '-' + event.address.toHexString() + '-1'

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

export function handleTransferred(event: RPLTransferred): void {
  // Ids
  const userId = event.params.to.toHexString()
  const positionId = userId + '-' + event.address.toHexString() + '-1'

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
