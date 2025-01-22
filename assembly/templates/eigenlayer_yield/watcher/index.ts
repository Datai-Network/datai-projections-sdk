import { Address } from '@graphprotocol/graph-ts'
import {
  activePositions,
  ActivePositionsResult,
  bytesToAddress,
  BI_0
} from 'datai-sdk'
import { EigenLayerStrategy, EigenLayerUserPosition } from '../generated/schema'
import { EigenLayerStrategy as EigenLayerStrategyContract } from '../generated/StrategyManager/EigenLayerStrategy'

export function GetActivePositions(): void {
  const position = activePositions.inputPosition<EigenLayerUserPosition>()
  const output = new ActivePositionsResult()

  const userAddress = Address.fromString(position.id.split('-')[0])
  const strategyAddress = Address.fromString(position.id.split('-')[1])
  const tokenAddress = bytesToAddress(
    EigenLayerStrategy.load(strategyAddress.toHexString())!.token
  )

  const strategyContract = EigenLayerStrategyContract.bind(strategyAddress)

  // Set results
  const sharesCall = strategyContract.try_shares(userAddress)

  if (!sharesCall.reverted && !sharesCall.value.equals(BI_0)) {
    const balanceCall = strategyContract.try_sharesToUnderlying(
      sharesCall.value
    )

    if (!balanceCall.reverted) {
      output.setSupplyBalance(tokenAddress, balanceCall.value)
      output.setPositionTokenBalance(tokenAddress, balanceCall.value)
      output.poolAddress = strategyAddress
    }
  }

  activePositions.output(output)
}
