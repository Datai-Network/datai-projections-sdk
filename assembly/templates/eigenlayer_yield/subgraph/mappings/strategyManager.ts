import { ensureUpdateTrigger, registerUser } from 'datai-sdk'
import {
  EigenLayerStrategy,
  EigenLayerUserPosition
} from '../../generated/schema'
import { Deposit } from '../../generated/StrategyManager/StrategyManager'

export function handleDeposit(event: Deposit): void {
  // Ids
  const userId = event.params.staker.toHexString()
  const strategyId = event.params.strategy.toHexString()
  const positionId = userId + '-' + strategyId

  // If trigger exists do nothing
  if (ensureUpdateTrigger(positionId, userId)) {
    return
  }

  // Protocol logic
  let eigenLayerUserPosition = EigenLayerUserPosition.load(positionId)
  if (eigenLayerUserPosition == null) {
    eigenLayerUserPosition = new EigenLayerUserPosition(positionId)
    eigenLayerUserPosition.user = userId
    eigenLayerUserPosition.save()
  }

  // TODO: store Underlying Token
  let eigenLayerStrategy = EigenLayerStrategy.load(strategyId)
  if (eigenLayerStrategy == null) {
    eigenLayerStrategy = new EigenLayerStrategy(strategyId)
    eigenLayerStrategy.token = event.params.token
    eigenLayerStrategy.save()
  }

  // Register User
  registerUser(userId)
}
