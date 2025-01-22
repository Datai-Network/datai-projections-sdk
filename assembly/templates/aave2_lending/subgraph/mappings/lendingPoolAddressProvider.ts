import { log } from '@graphprotocol/graph-ts'
import { ProxyCreated } from '../../generated/templates/LendingPoolAddressesProvider/LendingPoolAddressesProvider'
import { LendingPool as LendingPoolContract } from '../../generated/templates'
import { AavePoolAddressProvider, AavePool } from '../../generated/schema'

export function handleProxyCreated(event: ProxyCreated): void {
  const newProxyAddress = event.params.newAddress
  const contactId = event.params.id.toString()

  if (contactId != 'LENDING_POOL') {
    return
  }

  const poolId = newProxyAddress.toHexString()
  let pool = AavePool.load(poolId)
  if (pool == null) {
    pool = new AavePool(poolId)
    pool.save()
    LendingPoolContract.create(newProxyAddress)
  }

  const poolAddressProviderId = event.address.toHexString()
  const poolAddressProvider = AavePoolAddressProvider.load(
    poolAddressProviderId
  )
  if (poolAddressProvider == null) {
    log.error('PoolAddressProvider {} is not registered!', [
      poolAddressProviderId
    ])
    throw new Error(
      'PoolAddressProvider' + poolAddressProviderId + 'is not registered!'
    )
  }

  poolAddressProvider.lendingPool = newProxyAddress
  poolAddressProvider.save()
}
