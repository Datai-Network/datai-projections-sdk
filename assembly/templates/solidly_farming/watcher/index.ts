import { Address, BigInt } from '@graphprotocol/graph-ts'
import { SolidlyGauge as GaugeContract } from '../generated/templates/SolidlyGauge/SolidlyGauge'
import {
  activePositions,
  ActivePositionsResult,
  BI_0,
  bytesToAddress
} from 'datai-sdk'
import { SolidlyGauge, SolidlyUserPosition } from '../generated/schema'
import { getUnderlyingAmounts } from '../../../libs/solidly-lib'

export function GetActivePositions(): void {
  const solidlyPosition = activePositions.inputPosition<SolidlyUserPosition>()
  const output = new ActivePositionsResult()

  const solidlyGauge = SolidlyGauge.load(solidlyPosition.id.split('-')[1])
  if (solidlyGauge == null) {
    console.error('Gauge is not registered!')
    throw new Error('Gauge is not registered!')
  }
  const userAddress = Address.fromString(solidlyPosition.id.split('-')[0])
  const gaugeAddress = bytesToAddress(solidlyGauge.gauge)
  const poolAddress = bytesToAddress(solidlyGauge.pool)
  const token0Address = bytesToAddress(solidlyGauge.token0)
  const token1Address = bytesToAddress(solidlyGauge.token1)

  const positionBalance = getPositionBalance(userAddress, gaugeAddress)
  const underlyingBalances = getUnderlyingAmounts(poolAddress, positionBalance)

  // Set results
  output.setSupplyBalance(token0Address, underlyingBalances[0])
  output.setSupplyBalance(token1Address, underlyingBalances[1])
  output.setPositionTokenBalance(poolAddress, positionBalance)
  output.poolAddress = gaugeAddress

  activePositions.output(output)
}

function getPositionBalance(user: Address, gaugeAddress: Address): BigInt {
  const gaugeContract = GaugeContract.bind(gaugeAddress)
  const userBalance = gaugeContract.try_balanceOf(user)

  if (userBalance.reverted) {
    return BI_0
  }

  return userBalance.value
}
