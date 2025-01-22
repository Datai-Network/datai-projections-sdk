import { Address, BigInt, log } from '@graphprotocol/graph-ts'
import { IERC20 } from '../generated/templates/LendingPool/IERC20'
import { UiIncentives } from '../generated/templates/LendingPool/UiIncentives'

import { AavePool, AaveUserPosition } from '../generated/schema'
import {
  activePositions,
  ActivePositionsResult,
  BI_0,
  bytesToAddress
} from 'datai-sdk'
import { aave3UiIncentivesMap } from '../subgraph/utils/utils'

class TokenBalance {
  address: Address
  balance: BigInt

  constructor(address: Address, balance: BigInt) {
    this.address = address
    this.balance = balance
  }
}

export function GetActivePositions(): void {
  const aavePosition = activePositions.inputPosition<AaveUserPosition>()
  const output = new ActivePositionsResult()

  const positionIdArray = aavePosition.id.split('-')

  const tokenAddress = Address.fromBytes(aavePosition.internalToken)
  const underlyingTokenAddress = Address.fromBytes(aavePosition.underlyingToken)
  const userAddress = Address.fromString(aavePosition.user)
  const positionType = positionIdArray[3]

  if (positionType != '2') {
    // Supply & Borrow
    const tokenContract = IERC20.bind(tokenAddress)
    const balance = tokenContract.try_balanceOf(userAddress)

    // Set results
    if (balance.reverted) {
      throw new Error('Cannot retrieve balance of token')
    }

    if (balance.value != BI_0) {
      if (positionType == '1') {
        output.setBorrowBalance(underlyingTokenAddress, balance.value)
      } else {
        output.setSupplyBalance(underlyingTokenAddress, balance.value)
      }
      output.setPositionTokenBalance(tokenAddress, balance.value)
    }
  } else {
    // Rewards
    const rewardBalances = getPendingRewards(positionIdArray[1], userAddress)

    for (let i = 0; i < rewardBalances.length; i++) {
      output.setRewardBalance(
        rewardBalances[i].address,
        rewardBalances[i].balance
      )
    }
  }

  output.poolAddress = Address.fromString(aavePosition.pool)

  activePositions.output(output)
}

function getPendingRewards(
  poolId: string,
  userAddress: Address
): Array<TokenBalance> {
  const pool = AavePool.load(poolId)!
  const providerAddress = bytesToAddress(pool.addressProvider)
  const network = pool.network

  if (!aave3UiIncentivesMap.has(network + '-' + poolId)) {
    return []
  }

  const uiIncentivesDataProviderAddress = aave3UiIncentivesMap.get(
    network + '-' + poolId
  )

  const uiIncentivesDataProvider = UiIncentives.bind(
    uiIncentivesDataProviderAddress
  )

  const data = uiIncentivesDataProvider.try_getUserReservesIncentivesData(
    providerAddress,
    userAddress
  )

  if (data.reverted) {
    return []
  }

  const result: Array<TokenBalance> = []

  for (let i = 0; i < data.value.length; i++) {
    const rewardsInfo =
      data.value[i].aTokenIncentivesUserData.userRewardsInformation
    for (let j = 0; j < rewardsInfo.length; j++) {
      result.push(
        new TokenBalance(
          rewardsInfo[j].rewardTokenAddress,
          rewardsInfo[j].userUnclaimedRewards
        )
      )
    }
  }

  return result
}
