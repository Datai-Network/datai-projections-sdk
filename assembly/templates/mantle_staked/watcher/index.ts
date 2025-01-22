import { Address } from '@graphprotocol/graph-ts'
import { mEth } from '../generated/mEth/mEth'
import { Staking } from '../generated/mEth/Staking'
import { STAKING_ADDRESS } from '../subgraph/utils/constants'
import {
  ActivePositionsResult,
  activePositions,
  bytesToAddress
} from 'datai-sdk'
import { ADDRESS_ZERO } from 'datai-sdk'
import { MantleUserPosition } from '../generated/schema'

export function GetActivePositions(): void {
  const mantlePosition = activePositions.inputPosition<MantleUserPosition>()
  const output = new ActivePositionsResult()

  const positionArray = mantlePosition.id.split('-')

  const userAddress = Address.fromString(positionArray[0])
  const tokenAddress = Address.fromString(positionArray[1])

  const tokenContract = mEth.bind(tokenAddress)
  const stakingContract = Staking.bind(STAKING_ADDRESS)

  const tokenBalance = tokenContract.try_balanceOf(userAddress)

  if (!tokenBalance.reverted) {
    const balance = stakingContract.try_mETHToETH(tokenBalance.value)

    // Set results
    if (!balance.reverted) {
      output.setSupplyBalance(Address.fromString(ADDRESS_ZERO), balance.value)
      output.setPositionTokenBalance(tokenAddress, tokenBalance.value)
      output.poolAddress = tokenAddress
    }
  }

  activePositions.output(output)
}
