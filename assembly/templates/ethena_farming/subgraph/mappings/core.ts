import { EthenaUserPosition } from '../../generated/schema'
import { registerUser, ensureUpdateTrigger } from 'datai-sdk'
import { Stake } from '../../generated/EthenaLPStaking/EthenaLPStaking'

export function handleStake(event: Stake): void {
  // Ids
  const userId = event.params.user.toHexString()
  const tokenId = event.params.lpToken.toHexString()
  const positionId = userId + '-' + tokenId

  // If trigger exists do nothing
  if (ensureUpdateTrigger(positionId, userId)) {
    return
  }

  // Protocol logic
  let ethenaUserPosition = EthenaUserPosition.load(positionId)
  if (ethenaUserPosition == null) {
    ethenaUserPosition = new EthenaUserPosition(positionId)
    ethenaUserPosition.user = userId

    ethenaUserPosition.save()
  }

  // Register User
  registerUser(userId)
}
