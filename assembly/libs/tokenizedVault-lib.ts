import { Address, BigInt } from '@graphprotocol/graph-ts'
import { TokenizedVaultYield } from './templates/TokenizedVaultYield'
import { ADDRESS_ZERO, BI_0, BI_18 } from 'datai-sdk'

export function isTokenizedVault(token: Address): bool {
  const vaultContract = TokenizedVaultYield.bind(token)

  const asset = vaultContract.try_asset()
  const amount = vaultContract.try_convertToAssets(BI_18)

  if (!asset.reverted && !amount.reverted) {
    return true
  } else {
    return false
  }
}

export function getUnderlyingAsset(token: Address): Address {
  const vaultContract = TokenizedVaultYield.bind(token)

  const assetCall = vaultContract.try_asset()

  if (assetCall.reverted) {
    return Address.fromString(ADDRESS_ZERO)
  }

  return assetCall.value
}

export function getUnderlyingBalance(token: Address, shares: BigInt): BigInt {
  const vaultContract = TokenizedVaultYield.bind(token)

  const balanceCall = vaultContract.try_convertToAssets(shares)

  if (balanceCall.reverted) {
    return BI_0
  }

  return balanceCall.value
}
