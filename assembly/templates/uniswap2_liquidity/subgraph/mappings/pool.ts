import { Transfer } from '../../generated/templates/Pair/Pair'
import { ensureUpdateTrigger, registerUser, ADDRESS_ZERO } from 'datai-sdk'
import { Uniswap2UserPosition } from '../../generated/schema'

export function handleTransfer(event: Transfer): void {
  if (
    event.params.to.toHexString() == ADDRESS_ZERO ||
    event.params.to == event.address
  ) {
    return
  }

  // Ids
  const userId = event.params.to.toHexString()
  const poolId = event.address.toHexString()
  const positionId = userId + '-' + poolId

  // If trigger exists do nothing
  if (ensureUpdateTrigger(positionId, userId)) {
    return
  }

  // Protocol logic
  let uniswap2UserPosition = Uniswap2UserPosition.load(positionId)
  if (uniswap2UserPosition == null) {
    uniswap2UserPosition = new Uniswap2UserPosition(positionId)
    uniswap2UserPosition.user = userId
    uniswap2UserPosition.save()
  }

  // Register User
  registerUser(userId)
}
