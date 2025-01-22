import { Address } from '@graphprotocol/graph-ts'
import {
  activePositions,
  ActivePositionsResult,
  bytesToAddress
} from 'datai-sdk'
import { HypervisorPool, VisorUserPosition } from '../generated/schema'
import { Hypervisor as PoolContract } from '../generated/Hypervisor/Hypervisor'

export function GetActivePositions(): void {
  const visorPosition = activePositions.inputPosition<VisorUserPosition>()
  const output = new ActivePositionsResult()

  const pool = HypervisorPool.load(visorPosition.id.split('-')[1])
  if (pool == null) {
    console.error('Pool is not registered!')
    throw new Error('Pool is not registered!')
  }

  const userAddress = Address.fromString(visorPosition.id.split('-')[0])
  const poolAddress = Address.fromString(pool.id)

  // Contract calls
  const poolContract = PoolContract.bind(poolAddress)
  const balance = poolContract.try_balanceOf(userAddress)
  const totalSupply = poolContract.try_totalSupply()
  const totalAmounts = poolContract.try_getTotalAmounts()

  // Set results
  if (!balance.reverted && !totalSupply.reverted && !totalAmounts.reverted) {
    const amount0 = totalAmounts.value
      .getTotal0()
      .times(balance.value)
      .div(totalSupply.value)
    const amount1 = totalAmounts.value
      .getTotal1()
      .times(balance.value)
      .div(totalSupply.value)

    output.setSupplyBalance(bytesToAddress(pool.token0), amount0)
    output.setSupplyBalance(bytesToAddress(pool.token1), amount1)
    output.setPositionTokenBalance(poolAddress, balance.value)
  }
  output.poolAddress = poolAddress

  activePositions.output(output)
}
