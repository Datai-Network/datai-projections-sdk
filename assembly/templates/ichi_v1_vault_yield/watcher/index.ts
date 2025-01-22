import { Address } from '@graphprotocol/graph-ts'
import {
  activePositions,
  ActivePositionsResult,
  bytesToAddress
} from 'datai-sdk'
import { IchiUserPosition, IchiVault } from '../generated/schema'
import { Vault as VaultContract } from '../generated/templates/Vault/Vault'

export function GetActivePositions(): void {
  const ichiPosition = activePositions.inputPosition<IchiUserPosition>()
  const output = new ActivePositionsResult()

  const vault = IchiVault.load(ichiPosition.id.split('-')[1])
  if (vault == null) {
    console.error('Vault is not registered!')
    throw new Error('Vault is not registered!')
  }

  const userAddress = Address.fromString(ichiPosition.id.split('-')[0])
  const vaultAddress = Address.fromString(vault.id)

  // Contract calls
  const vaultContract = VaultContract.bind(vaultAddress)
  const balance = vaultContract.try_balanceOf(userAddress)
  const totalSupply = vaultContract.try_totalSupply()
  const totalAmounts = vaultContract.try_getTotalAmounts()

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

    output.setSupplyBalance(bytesToAddress(vault.token0), amount0)
    output.setSupplyBalance(bytesToAddress(vault.token1), amount1)
    output.setPositionTokenBalance(vaultAddress, balance.value)
  }
  output.poolAddress = vaultAddress

  activePositions.output(output)
}
