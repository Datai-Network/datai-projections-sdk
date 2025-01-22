import { Address, BigInt } from '@graphprotocol/graph-ts'
import { Staking } from '../generated/Staking0/Staking'
import {
  activePositions,
  ActivePositionsResult,
  bytesToAddress
} from 'datai-sdk'
import { StakingInfo, StakingUserPosition } from '../generated/schema'
import { getUnderlyingAmounts as getUnderlyingAmountsUniswap2 } from '../../../libs/uniswap2-lib'
import { getUnderlyingBalance as getUnderlyingBalanceVault } from '../../../libs/tokenizedVault-lib'
import { getUnderlyingAmounts as getUnderlyingAmountsCurve } from '../../../libs/curve-lib'

export function GetActivePositions(): void {
  const stakingPosition = activePositions.inputPosition<StakingUserPosition>()
  const output = new ActivePositionsResult()

  const userAddress = Address.fromString(stakingPosition.id.split('-')[0])
  const stakingAddress = Address.fromString(stakingPosition.id.split('-')[1])
  const stakingContract = Staking.bind(stakingAddress)

  const stakingInfo = StakingInfo.load(stakingAddress.toHexString())!
  const stakingToken = bytesToAddress(stakingInfo.stakingToken)
  const rewardToken = bytesToAddress(stakingInfo.rewardsToken)
  const underlingTokens = stakingInfo.underlyingTokens.map<Address>((item) =>
    bytesToAddress(item)
  )

  const balance = stakingContract.try_balanceOf(userAddress)
  const earned = stakingContract.try_earned(userAddress)

  // Set results
  if (!balance.reverted) {
    const supplyBalances = getSupplyBalances(
      stakingToken,
      balance.value,
      stakingInfo.underlyingProtocol
    )

    for (let i = 0; i < underlingTokens.length; i++) {
      output.setSupplyBalance(underlingTokens[i], supplyBalances[i])
    }

    output.setPositionTokenBalance(stakingToken, balance.value)
  }

  if (!earned.reverted) {
    output.setRewardBalance(rewardToken, earned.value)
  }

  output.poolAddress = stakingAddress

  activePositions.output(output)
}

function getSupplyBalances(
  stakingToken: Address,
  balance: BigInt,
  protocol: string
): Array<BigInt> {
  if (protocol === 'UNISWAP2') {
    return getUnderlyingAmountsUniswap2(stakingToken, balance)
  }

  if (protocol === 'TOKENIZED_VAULT') {
    return [getUnderlyingBalanceVault(stakingToken, balance)]
  }

  if (protocol === 'CURVE') {
    return getUnderlyingAmountsCurve(stakingToken, balance)
  }

  return [balance]
}
