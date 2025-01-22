import { ensureUpdateTrigger, registerUser } from 'datai-sdk'
import { Comet as CometContract, Supply } from '../../generated/Comet0/Comet'
import { Compound3UserPosition } from '../../generated/schema'

export function handleSupply(event: Supply): void {
  // Contract instance
  const cometContract = CometContract.bind(event.address)

  // Ids
  const userId = event.params.dst.toHexString()
  const tokenId = cometContract.baseToken().toHexString()
  const positionId = event.address.toHexString() + '-' + userId + '-' + tokenId

  // If trigger exists do nothing
  if (ensureUpdateTrigger(positionId, userId)) {
    return
  }

  // Protocol logic
  let compound3UserPosition = Compound3UserPosition.load(positionId)
  if (compound3UserPosition == null) {
    compound3UserPosition = new Compound3UserPosition(positionId)
    compound3UserPosition.user = userId
    compound3UserPosition.save()
  }

  // Register User
  registerUser(userId)
}
