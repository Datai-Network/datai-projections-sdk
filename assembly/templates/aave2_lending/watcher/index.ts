import { Address } from '@graphprotocol/graph-ts'
import { IERC20 } from '../generated/templates/LendingPool/IERC20'

import { AaveUserPosition } from '../generated/schema'
import { activePositions, ActivePositionsResult, BI_0 } from 'datai-sdk'

export function GetActivePositions(): void {
  const aavePosition = activePositions.inputPosition<AaveUserPosition>()
  const output = new ActivePositionsResult()

  const tokenAddress = Address.fromBytes(aavePosition.internalToken)
  const underlyingTokenAddress = Address.fromBytes(aavePosition.underlyingToken)
  const userAddress = Address.fromString(aavePosition.user)

  const tokenContract = IERC20.bind(tokenAddress)
  const balance = tokenContract.try_balanceOf(userAddress)

  // Set results
  if (balance.reverted) {
    throw new Error('Cannot retrieve balance of token')
  }

  if (balance.value != BI_0) {
    if (aavePosition.isBorrow) {
      output.setBorrowBalance(underlyingTokenAddress, balance.value)
    } else {
      output.setSupplyBalance(underlyingTokenAddress, balance.value)
    }
    output.setPositionTokenBalance(tokenAddress, balance.value)
  }

  output.poolAddress = Address.fromString(aavePosition.pool)

  activePositions.output(output)
}
