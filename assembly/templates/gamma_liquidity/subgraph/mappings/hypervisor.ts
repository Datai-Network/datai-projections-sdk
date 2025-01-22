import { Deposit } from '../../generated/Hypervisor/Hypervisor'
import { ensureUpdateTrigger, registerUser } from 'datai-sdk'
import { HypervisorPool, VisorUserPosition } from '../../generated/schema'
import { Hypervisor } from '../../generated/Hypervisor/Hypervisor'
import { Address } from '@graphprotocol/graph-ts'

export function handleDeposit(event: Deposit): void {
  // Ids
  const userId = event.params.to.toHexString()
  const poolId = event.address.toHexString()
  const positionId = userId + '-' + poolId

  // If trigger exists do nothing
  if (ensureUpdateTrigger(positionId, userId)) {
    return
  }

  // Protocol logic
  let visorUserPosition = VisorUserPosition.load(positionId)
  if (visorUserPosition == null) {
    visorUserPosition = new VisorUserPosition(positionId)
    visorUserPosition.user = userId
    visorUserPosition.save()
  }

  // Register User
  registerUser(userId)

  // Register pool entity
  registerPool(event.address)
}

function registerPool(poolId: Address): void {
  let pool = HypervisorPool.load(poolId.toHexString())
  if (!pool) {
    const poolContract = Hypervisor.bind(poolId)

    pool = new HypervisorPool(poolId.toHexString())
    pool.token0 = poolContract.token0()
    pool.token1 = poolContract.token1()
    pool.save()
  }
}
