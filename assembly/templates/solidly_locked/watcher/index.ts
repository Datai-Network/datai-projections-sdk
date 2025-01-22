import { Address, BigInt } from '@graphprotocol/graph-ts'
import { VotingEscrow } from '../generated/VotingEscrow/VotingEscrow'
import {
  activePositions,
  ActivePositionsResult,
  BI_1,
  bytesToAddress
} from 'datai-sdk'
import { Lock, SolidlyUserPosition } from '../generated/schema'

export function GetActivePositions(): void {
  const solidlyPosition = activePositions.inputPosition<SolidlyUserPosition>()
  const output = new ActivePositionsResult()

  const lock = Lock.load('id')!

  const userAddress = Address.fromString(solidlyPosition.id.split('-')[0])
  const lockAddress = bytesToAddress(lock.lockAddress)
  const assetAddress = bytesToAddress(lock.asset)
  const tokenId = BigInt.fromString(solidlyPosition.id.split('-')[1])
  const lockContract = VotingEscrow.bind(lockAddress)

  // Set results
  const lockedBalance = lockContract.try_locked(tokenId)
  if (!lockedBalance.reverted) {
    output.setSupplyBalance(assetAddress, lockedBalance.value.getAmount())
    output.unlockTime = lockedBalance.value.getEnd().toI32()
  }

  const positionBalance = lockContract.try_balanceOf(userAddress)
  if (!positionBalance.reverted) {
    output.setPositionTokenBalance(lockAddress, BI_1, tokenId)
  }

  output.poolAddress = lockAddress

  activePositions.output(output)
}
