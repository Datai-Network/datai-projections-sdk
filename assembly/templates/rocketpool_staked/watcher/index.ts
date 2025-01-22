import { Address } from '@graphprotocol/graph-ts'
import { RocketTokenRETH } from '../generated/RocketpoolRocketTokenRETH/RocketTokenRETH'
import { RocketNodeStaking } from '../generated/RocketNodeStaking/RocketNodeStaking'
import { ActivePositionsResult, activePositions, ADDRESS_ZERO } from 'datai-sdk'
import { RocketpoolUserPosition } from '../generated/schema'
import { RPL_ADDRESS } from '../subgraph/utils/constants'

export function GetActivePositions(): void {
  const rocketpoolPosition =
    activePositions.inputPosition<RocketpoolUserPosition>()
  const output = new ActivePositionsResult()

  const positionArray = rocketpoolPosition.id.split('-')

  const userAddress = Address.fromString(positionArray[0])
  const contractAdress = Address.fromString(positionArray[1])
  const positionType = positionArray[2]

  if (positionType == '0') {
    const rethContract = RocketTokenRETH.bind(contractAdress)
    const rethBalance = rethContract.try_balanceOf(userAddress)

    if (!rethBalance.reverted) {
      const balance = rethContract.try_getEthValue(rethBalance.value)

      // Set results
      if (!balance.reverted) {
        output.setSupplyBalance(Address.fromString(ADDRESS_ZERO), balance.value)
        output.setPositionTokenBalance(contractAdress, rethBalance.value)
        output.poolAddress = contractAdress
      }
    }
  } else if (positionType == '1') {
    const rocketNodeContract = RocketNodeStaking.bind(contractAdress)
    const balanceCall = rocketNodeContract.try_getNodeRPLStake(userAddress)

    if (!balanceCall.reverted) {
      output.setSupplyBalance(RPL_ADDRESS, balanceCall.value)
      output.setPositionTokenBalance(RPL_ADDRESS, balanceCall.value)
      output.poolAddress = contractAdress
    }
  }

  activePositions.output(output)
}
