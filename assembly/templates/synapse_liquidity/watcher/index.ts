import { Address, BigInt } from '@graphprotocol/graph-ts'
import {
  activePositions,
  ActivePositionsResult,
  BI_0,
  bytesToAddress
} from 'datai-sdk'
import { SynapsePool, SynapseUserPosition } from '../generated/schema'
import { LPToken } from '../generated/templates/LPToken/LPToken'
import { SwapPool } from '../generated/templates/LPToken/SwapPool'

export function GetActivePositions(): void {
  const synapsePosition = activePositions.inputPosition<SynapseUserPosition>()
  const output = new ActivePositionsResult()

  const synapsePool = SynapsePool.load(synapsePosition.id.split('-')[1])
  if (synapsePool == null) {
    console.error('Pool is not registered!')
    throw new Error('Pool' + synapsePosition.id + 'is not registered!')
  }
  const userAddress = Address.fromString(synapsePosition.id.split('-')[0])
  const swapPoolAddress = bytesToAddress(synapsePool.swapPool)
  const lpTokenAddress = bytesToAddress(synapsePool.lpToken)

  const positionBalance = getPositionBalance(userAddress, lpTokenAddress)
  const underlyingBalances = getUnderlyingBalances(
    swapPoolAddress,
    positionBalance,
    synapsePool.tokens.length
  )

  // Set results
  for (let i = 0; i < synapsePool.tokens.length; i++) {
    output.setSupplyBalance(
      bytesToAddress(synapsePool.tokens[i]),
      underlyingBalances[i]
    )
  }
  output.setPositionTokenBalance(lpTokenAddress, positionBalance)
  output.poolAddress = swapPoolAddress

  activePositions.output(output)
}

function getPositionBalance(user: Address, lpTokenAddress: Address): BigInt {
  const lpTokenContract = LPToken.bind(lpTokenAddress)
  const balance = lpTokenContract.try_balanceOf(user)

  if (balance.reverted) {
    return BI_0
  }

  return balance.value
}

function getUnderlyingBalances(
  swapPoolAddress: Address,
  lpAmount: BigInt,
  tokensLength: number
): BigInt[] {
  const swapPoolContract = SwapPool.bind(swapPoolAddress)
  const balances = swapPoolContract.try_calculateRemoveLiquidity(lpAmount)

  if (balances.reverted) {
    const result = new Array<BigInt>()
    for (let i = 0; i < tokensLength; i++) {
      result.push(BI_0)
    }

    return result
  }

  return balances.value
}
