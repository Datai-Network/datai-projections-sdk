import { Address } from '@graphprotocol/graph-ts'
import {
  activePositions,
  ActivePositionsResult,
  bytesToAddress
} from 'datai-sdk'
import {
  PoolTogetherTicket,
  PoolTogetherUserPosition
} from '../generated/schema'
import { Ticket } from '../generated/templates/Ticket/Ticket'

export function GetActivePositions(): void {
  const poolTogetherPosition =
    activePositions.inputPosition<PoolTogetherUserPosition>()
  const output = new ActivePositionsResult()

  const userAddress = Address.fromString(poolTogetherPosition.id.split('-')[0])
  const ticketAddress = Address.fromString(
    poolTogetherPosition.id.split('-')[1]
  )

  const ticketEntity = PoolTogetherTicket.load(ticketAddress.toHexString())!
  const tokenAddress = bytesToAddress(ticketEntity.token)
  const poolAddress = bytesToAddress(ticketEntity.pool)

  const ticketContract = Ticket.bind(ticketAddress)

  // Set results
  const balance = ticketContract.try_balanceOf(userAddress)
  if (!balance.reverted) {
    output.setSupplyBalance(tokenAddress, balance.value)
    output.setPositionTokenBalance(ticketAddress, balance.value)
    output.poolAddress = poolAddress
  }

  activePositions.output(output)
}
