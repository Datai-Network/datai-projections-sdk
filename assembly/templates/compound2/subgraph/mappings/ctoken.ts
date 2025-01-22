import { ensureUpdateTrigger, registerUser } from 'datai-sdk'
import { Compound2UserPosition } from '../../generated/schema'
import { Borrow, Transfer } from '../../generated/templates/CToken/CToken'

export function handleTransfer(event: Transfer): void {
  // Ids
  const userId = event.params.to.toHexString()
  const positionId = userId + '-' + event.address.toHexString() + '-0'

  // If trigger exists do nothing
  if (ensureUpdateTrigger(positionId, userId)) {
    return
  }

  // Protocol logic
  let compound2UserPosition = Compound2UserPosition.load(positionId)
  if (compound2UserPosition == null) {
    compound2UserPosition = new Compound2UserPosition(positionId)
    compound2UserPosition.user = userId
    compound2UserPosition.save()
  }

  // Register User
  registerUser(userId)
}

export function handleBorrow(event: Borrow): void {
  // Ids
  const userId = event.params.borrower.toHexString()
  const positionId = userId + '-' + event.address.toHexString() + '-1'

  // If trigger exists do nothing
  if (ensureUpdateTrigger(positionId, userId)) {
    return
  }

  // Protocol logic
  let compound2UserPosition = Compound2UserPosition.load(positionId)
  if (compound2UserPosition == null) {
    compound2UserPosition = new Compound2UserPosition(positionId)
    compound2UserPosition.user = userId
    compound2UserPosition.save()
  }

  // Register User
  registerUser(userId)
}
