import { NewPrizeVault } from '../../generated/PrizeVaultFactory/PrizeVaultFactory'
import { PrizeVault as PrizeVaultTemplate } from '../../generated/templates'
import { PrizeVault as VaultContract } from '../../generated/PrizeVaultFactory/PrizeVault'
import { PoolTogether4Vault } from '../../generated/schema'

export function handleNewPrizeVault(event: NewPrizeVault): void {
  let vault = PoolTogether4Vault.load(event.params.vault.toHexString())
  if (!vault) {
    const vaultContract = VaultContract.bind(event.params.vault)
    const token = vaultContract.asset()

    vault = new PoolTogether4Vault(event.params.vault.toHexString())
    vault.vault = event.params.vault
    vault.token = token
    vault.save()
  }

  // create the tracked contract based on the template
  PrizeVaultTemplate.create(event.params.vault)
}
