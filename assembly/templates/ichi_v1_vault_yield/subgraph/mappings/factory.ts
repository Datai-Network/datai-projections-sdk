import {
  ICHIVaultCreated,
  NewVault
} from '../../generated/VaultFactory/VaultFactory'
import { IchiVault } from '../../generated/schema'
import { Vault as VaultTemplate } from '../../generated/templates'
import { Vault as VaultContract } from '../../generated/templates/Vault/Vault'

export function handleVaultCreated(event: ICHIVaultCreated): void {
  // Store entity
  let vault = IchiVault.load(event.params.ichiVault.toHexString())
  if (vault == null) {
    vault = new IchiVault(event.params.ichiVault.toHexString())
    vault.token0 = event.params.tokenA
    vault.token1 = event.params.tokenB
    vault.save()
  }

  // create the tracked contract based on the template
  VaultTemplate.create(event.params.ichiVault)
}

export function handleNewVault(event: NewVault): void {
  // Store entity
  let vault = IchiVault.load(event.params.vault.toHexString())
  if (vault == null) {
    const vaultContract = VaultContract.bind(event.params.vault)
    const token0 = vaultContract.token0()
    const token1 = vaultContract.token1()

    vault = new IchiVault(event.params.vault.toHexString())
    vault.token0 = token0
    vault.token1 = token1
    vault.save()
  }

  // create the tracked contract based on the template
  VaultTemplate.create(event.params.vault)
}
