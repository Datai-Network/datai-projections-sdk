import { Address } from '@graphprotocol/graph-ts'
import { TokenizedVaultYield } from '../generated/TokenizedVaultYield0/TokenizedVaultYield'
import {
  activePositions,
  ActivePositionsResult,
  bytesToAddress
} from 'datai-sdk'
import { Vault, VaultUserPosition } from '../generated/schema'

export function GetActivePositions(): void {
  const vaultPosition = activePositions.inputPosition<VaultUserPosition>()
  const output = new ActivePositionsResult()

  const userAddress = Address.fromString(vaultPosition.id.split('-')[0])
  const vaultAddress = Address.fromString(vaultPosition.id.split('-')[1])
  const assetAddress = bytesToAddress(
    Vault.load(vaultPosition.id.split('-')[1])!.asset
  )
  const vaultContract = TokenizedVaultYield.bind(vaultAddress)

  // Set results
  const balanceShares = vaultContract.try_balanceOf(userAddress)
  if (!balanceShares.reverted) {
    const balance = vaultContract.try_convertToAssets(balanceShares.value)
    if (!balance.reverted) {
      output.setSupplyBalance(assetAddress, balance.value)
      output.setPositionTokenBalance(vaultAddress, balanceShares.value)
      output.poolAddress = vaultAddress
    }
  }

  activePositions.output(output)
}
