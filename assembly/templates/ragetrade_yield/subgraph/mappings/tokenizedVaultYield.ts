import { Address } from '@graphprotocol/graph-ts'
import { ensureUpdateTrigger, registerUser } from 'datai-sdk'
import { AngleUserPosition, Vault } from '../../generated/schema'
import {
  Deposit,
  Transfer,
  TokenizedVaultYield
} from '../../generated/TokenizedVaultYield/TokenizedVaultYield'

export function handleDeposit(event: Deposit): void {
  // Register Vault
  registerVault(event.address)

  // Ids
  const userId = event.params.owner.toHexString()
  const positionId = userId + '-' + event.address.toHexString()

  // If trigger exists do nothing
  if (ensureUpdateTrigger(positionId, userId)) {
    return
  }

  // Protocol logic
  let angleUserPosition = AngleUserPosition.load(positionId)
  if (angleUserPosition == null) {
    angleUserPosition = new AngleUserPosition(positionId)
    angleUserPosition.user = userId
    angleUserPosition.save()
  }

  // Register User
  registerUser(userId)
}

export function handleTransfer(event: Transfer): void {
  // Register Vault
  registerVault(event.address)

  // Ids
  const userId = event.params.to.toHexString()
  const positionId = userId + '-' + event.address.toHexString()

  // If trigger exists do nothing
  if (ensureUpdateTrigger(positionId, userId)) {
    return
  }

  // Protocol logic
  let angleUserPosition = AngleUserPosition.load(positionId)
  if (angleUserPosition == null) {
    angleUserPosition = new AngleUserPosition(positionId)
    angleUserPosition.user = userId
    angleUserPosition.save()
  }

  // Register User
  registerUser(userId)
}

function registerVault(vaultAddress: Address): void {
  let vault = Vault.load(vaultAddress.toHexString())
  if (vault == null) {
    vault = new Vault(vaultAddress.toHexString())
    vault.vault = vaultAddress
    vault.asset = TokenizedVaultYield.bind(vaultAddress).asset()
    vault.save()
  }
}
