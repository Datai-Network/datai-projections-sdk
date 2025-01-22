import { ensureUpdateTrigger, registerUser } from 'datai-sdk'
import { Deposit } from '../../generated/Staking/Staking'
import { StakingUserPosition } from '../../generated/schema'

export function handleDeposit(event: Deposit): void {
  // Ids
  const userId = event.params.depositor.toHexString()
  const positionId =
    userId +
    '-' +
    event.address.toHexString() +
    '-' +
    event.params.token.toHexString()

  // If trigger exists do nothing
  if (ensureUpdateTrigger(positionId, userId)) {
    return
  }

  // Protocol logic
  let stakingUserPosition = StakingUserPosition.load(positionId)
  if (stakingUserPosition == null) {
    stakingUserPosition = new StakingUserPosition(positionId)
    stakingUserPosition.user = userId
    stakingUserPosition.save()
  }

  // Register User
  registerUser(userId)
}
