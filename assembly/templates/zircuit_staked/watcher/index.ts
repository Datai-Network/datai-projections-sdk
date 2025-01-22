import { Address } from '@graphprotocol/graph-ts'
import { Staking } from '../generated/Staking/Staking'
import { activePositions, ActivePositionsResult, BI_0 } from 'datai-sdk'
import { StakingUserPosition } from '../generated/schema'

export function GetActivePositions(): void {
  const stakingPosition = activePositions.inputPosition<StakingUserPosition>()
  const output = new ActivePositionsResult()

  const userAddress = Address.fromString(stakingPosition.id.split('-')[0])
  const stakingAddress = Address.fromString(stakingPosition.id.split('-')[1])
  const tokenAddress = Address.fromString(stakingPosition.id.split('-')[2])

  const stakingContract = Staking.bind(stakingAddress)
  const balanceCall = stakingContract.try_balance(tokenAddress, userAddress)

  // Set results
  if (!balanceCall.reverted) {
    output.setSupplyBalance(tokenAddress, balanceCall.value)
    output.setPositionTokenBalance(tokenAddress, balanceCall.value)
  }

  output.poolAddress = stakingAddress

  activePositions.output(output)
}
