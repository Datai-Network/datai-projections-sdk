import { Address } from '@graphprotocol/graph-ts'
import {
  activePositions,
  ActivePositionsResult,
  bytesToAddress
} from 'datai-sdk'
import { VesterTokens, VesterUserPosition } from '../generated/schema'
import { Vester } from '../generated/Vester/Vester'

export function GetActivePositions(): void {
  const vesterPosition = activePositions.inputPosition<VesterUserPosition>()
  const output = new ActivePositionsResult()

  const positionIdArray = vesterPosition.id.split('-')
  const vesterTokens = VesterTokens.load(positionIdArray[1])!

  const userAddress = Address.fromString(positionIdArray[0])
  const vesterAddress = Address.fromString(positionIdArray[1])
  const underlyingAddress = bytesToAddress(vesterTokens.underlyingToken)
  const claimableAddress = bytesToAddress(vesterTokens.claimableToken)

  const vesterContract = Vester.bind(vesterAddress)

  const balance = vesterContract.try_balanceOf(userAddress)
  const claimable = vesterContract.try_claimable(userAddress)

  // Set results
  if (!balance.reverted && !claimable.reverted) {
    output.setSupplyBalance(
      underlyingAddress,
      balance.value.minus(claimable.value)
    )
    output.setPositionTokenBalance(vesterAddress, balance.value)
    output.setRewardBalance(claimableAddress, claimable.value)
  }
  output.poolAddress = vesterAddress

  activePositions.output(output)
}
