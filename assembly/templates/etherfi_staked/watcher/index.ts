import { Address } from '@graphprotocol/graph-ts'
import { EtherfiUserPosition } from '../generated/schema'
import { WEETH } from '../generated/WEETH/WEETH'
import {
  activePositions,
  ActivePositionsResult,
  bytesToAddress
} from 'datai-sdk'
import { weETH } from '../subgraph/constants'

export function GetActivePositions(): void {
  const etherfiPosition = activePositions.inputPosition<EtherfiUserPosition>()
  const output = new ActivePositionsResult()

  const userAddress = Address.fromString(etherfiPosition.user)
  const tokenAddress = Address.fromString(etherfiPosition.id.split('-')[1])
  const underlyingToken = bytesToAddress(etherfiPosition.underlyingToken)

  const tokenContract = WEETH.bind(tokenAddress)
  const balanceCall = tokenContract.try_balanceOf(userAddress)

  // Set results
  if (!balanceCall.reverted) {
    let balance = balanceCall.value
    if (tokenAddress == weETH) {
      balance = tokenContract.getEETHByWeETH(balance)
    }
    output.setSupplyBalance(underlyingToken, balance)
    output.setPositionTokenBalance(tokenAddress, balance)
    output.poolAddress = tokenAddress
  }

  activePositions.output(output)
}
