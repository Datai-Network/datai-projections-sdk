import { Address } from '@graphprotocol/graph-ts'
import {
  activePositions,
  ActivePositionsResult,
  bytesToAddress
} from 'datai-sdk'
import { Compound2Market, Compound2UserPosition } from '../generated/schema'
import { CToken } from '../generated/templates/CToken/CToken'

export function GetActivePositions(): void {
  const compound2Position =
    activePositions.inputPosition<Compound2UserPosition>()
  const output = new ActivePositionsResult()

  const positionIdArray = compound2Position.id.split('-')

  const userAddress = Address.fromString(positionIdArray[0])
  const cTokenAddress = Address.fromString(positionIdArray[1])
  const underlyingAddress = bytesToAddress(
    Compound2Market.load(positionIdArray[1])!.underlyingAddress
  )
  const actionType = positionIdArray[2]
  const cTokenContract = CToken.bind(cTokenAddress)

  // Set results
  if (actionType == '0') {
    const balance = cTokenContract.try_balanceOfUnderlying(userAddress)
    const positionBalance = cTokenContract.try_balanceOf(userAddress)

    if (!balance.reverted) {
      output.setSupplyBalance(underlyingAddress, balance.value)
    }

    if (!positionBalance.reverted) {
      output.setPositionTokenBalance(cTokenAddress, positionBalance.value)
    }
  } else {
    const balance = cTokenContract.try_borrowBalanceCurrent(userAddress)

    if (!balance.reverted) {
      output.setBorrowBalance(underlyingAddress, balance.value)
      output.setPositionTokenBalance(underlyingAddress, balance.value)
    }
  }
  output.poolAddress = cTokenAddress

  activePositions.output(output)
}
