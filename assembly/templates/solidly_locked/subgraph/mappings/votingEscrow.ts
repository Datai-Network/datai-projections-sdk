import { Address } from '@graphprotocol/graph-ts'
import { ensureUpdateTrigger, registerUser } from 'datai-sdk'
import {
  Transfer,
  VotingEscrow
} from '../../generated/VotingEscrow/VotingEscrow'
import { Lock, SolidlyUserPosition } from '../../generated/schema'

export function handleTransfer(event: Transfer): void {
  // Register Vault
  registerLock(event.address)

  // Ids
  const userId = event.params.to.toHexString()
  const positionId = userId + '-' + event.params.tokenId.toString()

  // If trigger exists do nothing
  if (ensureUpdateTrigger(positionId, userId)) {
    return
  }

  // Protocol logic
  let solidlyUserPosition = SolidlyUserPosition.load(positionId)
  if (solidlyUserPosition == null) {
    solidlyUserPosition = new SolidlyUserPosition(positionId)
    solidlyUserPosition.user = userId
    solidlyUserPosition.save()
  }

  // Register User
  registerUser(userId)
}

function registerLock(lockAddress: Address): void {
  let lock = Lock.load('id')
  if (lock == null) {
    lock = new Lock('id')
    lock.lockAddress = lockAddress
    lock.asset = VotingEscrow.bind(lockAddress).token()
    lock.save()
  }
}
