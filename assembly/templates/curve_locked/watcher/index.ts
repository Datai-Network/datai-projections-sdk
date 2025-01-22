import { Address } from '@graphprotocol/graph-ts'
import { VotingEscrow } from '../generated/VotingEscrow/VotingEscrow'
import {
  activePositions,
  ActivePositionsResult,
  bytesToAddress
} from 'datai-sdk'
import { FxProtocolUserPosition, Lock } from '../generated/schema'

export function GetActivePositions(): void {
  const lockerPosition = activePositions.inputPosition<FxProtocolUserPosition>()
  const output = new ActivePositionsResult()

  const userAddress = Address.fromString(lockerPosition.id.split('-')[0])
  const lockAddress = Address.fromString(lockerPosition.id.split('-')[1])
  const assetAddress = bytesToAddress(
    Lock.load(lockerPosition.id.split('-')[1])!.asset
  )
  const lockContract = VotingEscrow.bind(lockAddress)

  // Set results
  const lockedBalance = lockContract.try_locked(userAddress)
  if (!lockedBalance.reverted) {
    output.setSupplyBalance(assetAddress, lockedBalance.value.amount)
    output.unlockTime = lockedBalance.value.end.toI32()
  }

  const positionBalance = lockContract.try_balanceOf(userAddress)
  if (!positionBalance.reverted) {
    output.setPositionTokenBalance(lockAddress, positionBalance.value)
  }

  output.poolAddress = lockAddress

  activePositions.output(output)
}
