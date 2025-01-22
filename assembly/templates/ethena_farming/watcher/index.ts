import { Address, BigInt } from '@graphprotocol/graph-ts'
import { EthenaUserPosition } from '../generated/schema'
import { EthenaLPStaking } from '../generated/EthenaLPStaking/EthenaLPStaking'
import { StakedEna } from '../generated/EthenaLPStaking/StakedEna'
import { activePositions, ActivePositionsResult } from 'datai-sdk'

const stakingAddress = Address.fromString(
  '0x8707f238936c12c309bfc2b9959c35828acfc512'
)

export function GetActivePositions(): void {
  const ethenaUserPosition = activePositions.inputPosition<EthenaUserPosition>()
  const output = new ActivePositionsResult()

  const userAddress = Address.fromString(ethenaUserPosition.user)
  const tokenAddress = Address.fromString(ethenaUserPosition.id.split('-')[1])

  const stakingContract = EthenaLPStaking.bind(stakingAddress)
  const stakedEnaContract = StakedEna.bind(tokenAddress)

  const positionBalanceCall = stakingContract.try_stakes(
    userAddress,
    tokenAddress
  )
  if (!positionBalanceCall.reverted) {
    let asset: Address
    let balance: BigInt

    const assetCall = stakedEnaContract.try_asset()

    const balanceCall = stakedEnaContract.try_convertToAssets(
      positionBalanceCall.value.getStakedAmount()
    )

    if (!balanceCall.reverted && !assetCall.reverted) {
      asset = assetCall.value
      balance = balanceCall.value
    } else {
      asset = tokenAddress
      balance = positionBalanceCall.value.getStakedAmount()
    }

    // Set results
    output.setSupplyBalance(tokenAddress, balance)
    output.setPositionTokenBalance(
      tokenAddress,
      positionBalanceCall.value.getStakedAmount()
    )

    output.poolAddress = stakingAddress
  }

  activePositions.output(output)
}
