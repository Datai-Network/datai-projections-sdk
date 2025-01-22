import { Address } from '@graphprotocol/graph-ts'
import { Comet as CometContract } from '../generated/Comet0/Comet'
import { activePositions, ActivePositionsResult } from 'datai-sdk'
import { Compound3UserPosition } from '../generated/schema'

export function GetActivePositions(): void {
  const compound3Position =
    activePositions.inputPosition<Compound3UserPosition>()
  const output = new ActivePositionsResult()

  const positionIdArray = compound3Position.id.split('-')

  const cometAddress = Address.fromString(positionIdArray[0])
  const userAddress = Address.fromString(positionIdArray[1])
  const assetAddress = Address.fromString(positionIdArray[2])
  const cometContract = CometContract.bind(cometAddress)

  // Set results
  const balance = cometContract.try_balanceOf(userAddress)
  if (!balance.reverted) {
    output.setSupplyBalance(assetAddress, balance.value)
    output.setPositionTokenBalance(assetAddress, balance.value)
  }

  output.poolAddress = cometAddress

  activePositions.output(output)
}
