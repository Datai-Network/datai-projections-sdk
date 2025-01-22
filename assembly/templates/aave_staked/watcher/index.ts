import { Address } from '@graphprotocol/graph-ts'
import { activePositions, ActivePositionsResult } from 'datai-sdk'
import { StakedToken } from '../generated/StakedToken0/StakedToken'
import { AaveStakedUserPosition } from '../generated/schema'

export function GetActivePositions(): void {
  const aavePosition = activePositions.inputPosition<AaveStakedUserPosition>()
  const output = new ActivePositionsResult()

  const userAddress = Address.fromString(aavePosition.user)
  const tokenAddress = Address.fromString(aavePosition.id.split('-')[1])

  const stakedTokenContract = StakedToken.bind(tokenAddress)

  const balanceCall = stakedTokenContract.try_balanceOf(userAddress)
  if (!balanceCall.reverted) {
    output.setSupplyBalance(
      stakedTokenContract.STAKED_TOKEN(),
      balanceCall.value
    )
    output.setPositionTokenBalance(tokenAddress, balanceCall.value)
  }

  const rewardTokenCall = stakedTokenContract.try_REWARD_TOKEN()
  const rewardsCall =
    stakedTokenContract.try_getTotalRewardsBalance(userAddress)
  if (!rewardsCall.reverted && !rewardTokenCall.reverted) {
    output.setRewardBalance(rewardTokenCall.value, rewardsCall.value)
  }

  output.poolAddress = tokenAddress

  activePositions.output(output)
}
