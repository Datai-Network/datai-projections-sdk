import { Address } from '@graphprotocol/graph-ts'
import { Comet as CometContract } from '../generated/Comet0/Comet'
import { CometRewards as CometRewardsContract } from '../generated/Comet0/CometRewards'
import {
  activePositions,
  ActivePositionsResult,
  bytesToAddress
} from 'datai-sdk'
import { Comet, Compound3UserPosition } from '../generated/schema'

export function GetActivePositions(): void {
  const compound3Position =
    activePositions.inputPosition<Compound3UserPosition>()
  const output = new ActivePositionsResult()

  const positionIdArray = compound3Position.id.split('-')

  const userAddress = Address.fromString(positionIdArray[0])
  const cometAddress = bytesToAddress(Comet.load('id')!.comet)
  const cometRewardsAddress = bytesToAddress(Comet.load('id')!.rewards)
  const assetAddress = Address.fromString(positionIdArray[1])
  const actionType = positionIdArray[2]
  const cometContract = CometContract.bind(cometAddress)
  const cometRewardsContract = CometRewardsContract.bind(cometRewardsAddress)

  // Set results
  if (actionType == '0') {
    const balance = cometContract.try_userCollateral(userAddress, assetAddress)
    if (!balance.reverted) {
      output.setSupplyBalance(assetAddress, balance.value.getBalance())
      output.setPositionTokenBalance(assetAddress, balance.value.getBalance())
    }
  } else if (actionType == '1') {
    const balance = cometContract.try_borrowBalanceOf(userAddress)
    if (!balance.reverted) {
      output.setBorrowBalance(assetAddress, balance.value)
      output.setPositionTokenBalance(assetAddress, balance.value)
    }
  } else {
    const rewardsBalance = cometRewardsContract.try_getRewardOwed(
      cometAddress,
      userAddress
    )

    if (!rewardsBalance.reverted) {
      output.setRewardBalance(
        rewardsBalance.value.token,
        rewardsBalance.value.owed
      )
      output.setPositionTokenBalance(
        rewardsBalance.value.token,
        rewardsBalance.value.owed
      )
    }
  }

  output.poolAddress = cometAddress

  activePositions.output(output)
}
