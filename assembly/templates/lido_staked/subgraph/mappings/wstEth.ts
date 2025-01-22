import { ensureUpdateTrigger, registerUser, ADDRESS_ZERO } from 'datai-sdk'
import { Transfer } from '../../generated/WStEth/WStEth'
import { LidoUserPosition } from '../../generated/schema'

export function handleTransfer(event: Transfer): void {
  if (event.params.to.toHexString() == ADDRESS_ZERO) {
    return
  }

  // Ids
  const userId = event.params.to.toHexString()
  const positionId = userId + '-' + '1'

  // If trigger exists do nothing
  if (ensureUpdateTrigger(positionId, userId)) {
    return
  }

  // Protocol logic
  let lidoUserPosition = LidoUserPosition.load(positionId)
  if (lidoUserPosition == null) {
    lidoUserPosition = new LidoUserPosition(positionId)
    lidoUserPosition.user = userId
    lidoUserPosition.tokenAddress = event.address
    lidoUserPosition.save()
  }

  // Register User
  registerUser(userId)
}
