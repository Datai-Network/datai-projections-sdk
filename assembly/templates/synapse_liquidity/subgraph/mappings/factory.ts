import { LPToken as LPTokenTemplate } from '../../generated/templates'
import { SynapsePool } from '../../generated/schema'
import { SwapPool } from '../../generated/templates/LPToken/SwapPool'
import { NewSwapPool } from '../../generated/Factory/Factory'
import { Bytes } from '@graphprotocol/graph-ts'
import { addressToBytes } from 'datai-sdk'

export function handleNewSwapPool(event: NewSwapPool): void {
  const swapPool = SwapPool.bind(event.params.swapAddress)
  const lpAddress = swapPool.swapStorage().getLpToken()

  // Store some entities
  const synapsePool = new SynapsePool(lpAddress.toHexString())
  synapsePool.swapPool = event.params.swapAddress
  synapsePool.lpToken = lpAddress
  synapsePool.tokens = event.params.pooledTokens.map<Bytes>((item) =>
    addressToBytes(item)
  )
  synapsePool.save()

  // create the tracked contract based on the template
  LPTokenTemplate.create(lpAddress)
}
