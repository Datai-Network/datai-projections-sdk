import { Address } from '@graphprotocol/graph-ts'
import {
  activePositions,
  ActivePositionsResult,
  bytesToAddress
} from 'datai-sdk'
import {
  PoolTogether4Vault,
  PoolTogether4UserPosition
} from '../generated/schema'
import { PrizeVault } from '../generated/templates/PrizeVault/PrizeVault'

export function GetActivePositions(): void {
  console.log('test0')
  const poolTogetherPosition =
    activePositions.inputPosition<PoolTogether4UserPosition>()
  const output = new ActivePositionsResult()

  const userAddress = Address.fromString(poolTogetherPosition.id.split('-')[0])
  const vaultAddress = Address.fromString(poolTogetherPosition.id.split('-')[1])

  const vault = PoolTogether4Vault.load(vaultAddress.toHexString())!
  const tokenAddress = bytesToAddress(vault.token)

  const vaultContract = PrizeVault.bind(vaultAddress)

  // Set results
  const balanceShares = vaultContract.try_balanceOf(userAddress)
  if (!balanceShares.reverted) {
    const balance = vaultContract.try_convertToAssets(balanceShares.value)
    if (!balance.reverted) {
      output.setSupplyBalance(tokenAddress, balance.value)
      output.setPositionTokenBalance(vaultAddress, balanceShares.value)
      output.poolAddress = vaultAddress
    }
  }

  activePositions.output(output)
}
