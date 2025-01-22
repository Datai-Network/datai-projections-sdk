import { PairCreated } from '../../generated/Factory/Factory'
import { Pair as PairTemplate } from '../../generated/templates'
import { SolidlyPool } from '../../generated/schema'

export function handleNewPair(event: PairCreated): void {
  // Store some entities
  let pool = SolidlyPool.load(event.params.pair.toHexString())
  if (pool == null) {
    pool = new SolidlyPool(event.params.pair.toHexString())
    pool.token0 = event.params.token0
    pool.token1 = event.params.token1
    pool.save()
  }

  // create the tracked contract based on the template
  PairTemplate.create(event.params.pair)
}
