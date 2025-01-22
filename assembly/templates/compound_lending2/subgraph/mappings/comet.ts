import { Address } from '@graphprotocol/graph-ts'
import { ADDRESS_ZERO, ensureUpdateTrigger, registerUser } from 'datai-sdk'
import {
  SupplyCollateral,
  TransferCollateral,
  Withdraw,
  Comet as CometContract
} from '../../generated/Comet0/Comet'
import { CometRewards as CometRewardsContract } from '../../generated/Comet0/CometRewards'
import { Comet, Compound3UserPosition } from '../../generated/schema'
import { rewardsMap } from '../utils/rewards'

export function handleSupplyCollateral(event: SupplyCollateral): void {
  // Register Comet
  registerComet(event.address, event.params.dst)

  // REGULAR POSITION
  // Ids
  const userId = event.params.dst.toHexString()
  let tokenId = event.params.asset.toHexString()
  let positionId = userId + '-' + tokenId + '-0'

  // If trigger exists do nothing
  if (ensureUpdateTrigger(positionId, userId)) {
    return
  }

  // Protocol logic
  let compound3UserPosition = Compound3UserPosition.load(positionId)
  if (compound3UserPosition == null) {
    compound3UserPosition = new Compound3UserPosition(positionId)
    compound3UserPosition.user = userId
    compound3UserPosition.save()
  }

  // REWARDS POSITION
  // Ids
  tokenId = Comet.load('id')!.rewardAsset.toHexString()
  if (tokenId != ADDRESS_ZERO) {
    positionId = userId + '-' + tokenId + '-2'

    // If trigger exists do nothing
    if (ensureUpdateTrigger(positionId, userId)) {
      return
    }

    // Protocol logic
    compound3UserPosition = Compound3UserPosition.load(positionId)
    if (compound3UserPosition == null) {
      compound3UserPosition = new Compound3UserPosition(positionId)
      compound3UserPosition.user = userId
      compound3UserPosition.save()
    }
  }

  // Register User
  registerUser(userId)
}

export function handleTransferCollateral(event: TransferCollateral): void {
  // Register Comet
  registerComet(event.address, event.params.to)

  // REGULAR POSITION
  // Ids
  const userId = event.params.to.toHexString()
  let tokenId = event.params.asset.toHexString()
  let positionId = userId + '-' + tokenId + '-0'

  // If trigger exists do nothing
  if (ensureUpdateTrigger(positionId, userId)) {
    return
  }

  // Protocol logic
  let compound3UserPosition = Compound3UserPosition.load(positionId)
  if (compound3UserPosition == null) {
    compound3UserPosition = new Compound3UserPosition(positionId)
    compound3UserPosition.user = userId
    compound3UserPosition.save()
  }

  // REWARDS POSITION
  // Ids
  tokenId = Comet.load('id')!.rewardAsset.toHexString()
  if (tokenId != ADDRESS_ZERO) {
    positionId = userId + '-' + tokenId + '-2'

    // If trigger exists do nothing
    if (ensureUpdateTrigger(positionId, userId)) {
      return
    }

    // Protocol logic
    compound3UserPosition = Compound3UserPosition.load(positionId)
    if (compound3UserPosition == null) {
      compound3UserPosition = new Compound3UserPosition(positionId)
      compound3UserPosition.user = userId
      compound3UserPosition.save()
    }
  }

  // Register User
  registerUser(userId)
}

export function handleWithdraw(event: Withdraw): void {
  const comet = Comet.load('id')!

  // REGULAR POSITION
  // Ids
  const userId = event.params.src.toHexString()
  let tokenId = comet.baseAsset.toHexString()
  let positionId = userId + '-' + tokenId + '-1'

  // If trigger exists do nothing
  if (ensureUpdateTrigger(positionId, userId)) {
    return
  }

  // Protocol logic
  let compound3UserPosition = Compound3UserPosition.load(positionId)
  if (compound3UserPosition == null) {
    compound3UserPosition = new Compound3UserPosition(positionId)
    compound3UserPosition.user = userId
    compound3UserPosition.save()
  }

  // REWARDS POSITION
  // Ids
  tokenId = comet.rewardAsset.toHexString()
  if (tokenId != ADDRESS_ZERO) {
    positionId = userId + '-' + tokenId + '-2'

    // If trigger exists do nothing
    if (ensureUpdateTrigger(positionId, userId)) {
      return
    }

    // Protocol logic
    compound3UserPosition = Compound3UserPosition.load(positionId)
    if (compound3UserPosition == null) {
      compound3UserPosition = new Compound3UserPosition(positionId)
      compound3UserPosition.user = userId
      compound3UserPosition.save()
    }
  }

  // Register User
  registerUser(userId)
}

function registerComet(cometAddress: Address, user: Address): void {
  const hasRewards = rewardsMap.has(cometAddress.toHexString())
  let rewardAsset = Address.fromString(ADDRESS_ZERO)

  if (hasRewards) {
    const cometRewardsContract = CometRewardsContract.bind(
      rewardsMap.get(cometAddress.toHexString())
    )
    const rewardAssetCall = cometRewardsContract.try_getRewardOwed(
      cometAddress,
      user
    )
    if (!rewardAssetCall.reverted) {
      rewardAsset = rewardAssetCall.value.token
    }
  }

  let comet = Comet.load('id')
  if (comet == null) {
    comet = new Comet('id')
    comet.comet = cometAddress
    comet.rewards = rewardsMap.has(cometAddress.toHexString())
      ? rewardsMap.get(cometAddress.toHexString())
      : Address.fromString(ADDRESS_ZERO)
    comet.baseAsset = CometContract.bind(cometAddress).baseToken()
    comet.rewardAsset = rewardAsset
    comet.save()
  }
}
