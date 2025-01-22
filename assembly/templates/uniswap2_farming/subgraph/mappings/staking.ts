import { Address, Bytes } from '@graphprotocol/graph-ts'
import { ensureUpdateTrigger, registerUser, addressToBytes } from 'datai-sdk'
import { Staked, Staking } from '../../generated/Staking0/Staking'
import { StakingInfo, StakingUserPosition } from '../../generated/schema'
import {
  getUnderlyingTokens as getUnderlyingTokensUniswap2,
  isUniswap2
} from '../../../../libs/uniswap2-lib'
import {
  getUnderlyingAsset,
  isTokenizedVault
} from '../../../../libs/tokenizedVault-lib'
import { getUnderlyingCoins, isCurve } from '../../../../libs/curve-lib'

export function handleStaked(event: Staked): void {
  // Ids
  const userId = event.params.user.toHexString()
  const positionId = userId + '-' + event.address.toHexString()

  // Register staking address
  registerStakingAddress(event.address)

  // If trigger exists do nothing
  if (ensureUpdateTrigger(positionId, userId)) {
    return
  }

  // Protocol logic
  let stakingUserPosition = StakingUserPosition.load(positionId)
  if (stakingUserPosition == null) {
    stakingUserPosition = new StakingUserPosition(positionId)
    stakingUserPosition.user = userId
    stakingUserPosition.save()
  }

  // Register User
  registerUser(userId)
}

function registerStakingAddress(address: Address): void {
  let stakingInfo = StakingInfo.load(address.toHexString())
  if (stakingInfo == null) {
    const stakingContract = Staking.bind(address)
    const stakingToken = stakingContract.stakingToken()
    const rewardsToken = stakingContract.rewardsToken()

    let underlyingProtocol = 'UNDERLYING'
    let underlyingTokens = [stakingToken]

    if (isUniswap2(stakingToken)) {
      underlyingProtocol = 'UNISWAP2'
      underlyingTokens = getUnderlyingTokensUniswap2(stakingToken)
    } else if (isTokenizedVault(stakingToken)) {
      underlyingProtocol = 'TOKENIZED_VAULT'
      underlyingTokens = [getUnderlyingAsset(stakingToken)]
    } else if (isCurve(stakingToken)) {
      underlyingProtocol = 'CURVE'
      underlyingTokens = getUnderlyingCoins(stakingToken)
    }

    stakingInfo = new StakingInfo(address.toHexString())
    stakingInfo.stakingToken = stakingToken
    stakingInfo.rewardsToken = rewardsToken
    stakingInfo.underlyingProtocol = underlyingProtocol
    stakingInfo.underlyingTokens = underlyingTokens.map<Bytes>((item) =>
      addressToBytes(item)
    )
    stakingInfo.save()
  }
}
