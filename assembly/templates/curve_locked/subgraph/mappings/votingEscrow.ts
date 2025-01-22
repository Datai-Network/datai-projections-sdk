import { Address } from '@graphprotocol/graph-ts'
import { ensureUpdateTrigger, registerUser } from 'datai-sdk'
import { Lock, FxProtocolUserPosition } from '../../generated/schema'
import {
  Deposit,
  VotingEscrow
} from '../../generated/VotingEscrow/VotingEscrow'

export function handleDeposit(event: Deposit): void {
  // Register Vault
  registerLock(event.address)

  // Ids
  const userId = event.params.provider.toHexString()
  const positionId = userId + '-' + event.address.toHexString()

  // If trigger exists do nothing
  if (ensureUpdateTrigger(positionId, userId)) {
    return
  }

  // Protocol logic
  let lockerUserPosition = FxProtocolUserPosition.load(positionId)
  if (lockerUserPosition == null) {
    lockerUserPosition = new FxProtocolUserPosition(positionId)
    lockerUserPosition.user = userId
    lockerUserPosition.save()
  }

  // Register User
  registerUser(userId)
}

function registerLock(lockAddress: Address): void {
  let lock = Lock.load(lockAddress.toHexString())
  if (lock == null) {
    lock = new Lock(lockAddress.toHexString())
    lock.lockAddress = lockAddress
    lock.asset = VotingEscrow.bind(lockAddress).token()
    lock.save()
  }
}
