import { AavePoolAddressProvider } from '../../generated/schema'
import { LendingPoolAddressesProvider as LendingPoolAddressesProviderContract } from '../../generated/templates'
import { AddressesProviderRegistered } from '../../generated/LendingPoolAddressesProviderRegistry/LendingPoolAddressesProviderRegistry'

export function handleAddressesProviderRegistered(
  event: AddressesProviderRegistered
): void {
  const address = event.params.newAddress
  const id = address.toHexString()

  if (AavePoolAddressProvider.load(id) == null) {
    const poolAddressProvider = new AavePoolAddressProvider(id)
    poolAddressProvider.save()

    LendingPoolAddressesProviderContract.create(address)
  }
}
