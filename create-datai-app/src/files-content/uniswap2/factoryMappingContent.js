module.exports = `import { PairCreated } from '../../generated/Factory/Factory'
import { Pair as PairTemplate } from '../../generated/templates'
import { Uniswap2Pool } from '../../generated/schema'

export function handleNewPair(event: PairCreated): void {
  // Store some entities
  let pool = Uniswap2Pool.load(event.params.pair.toHexString())
  if (pool == null) {
    pool = new Uniswap2Pool(event.params.pair.toHexString())
    pool.token0 = event.params.token0
    pool.token1 = event.params.token1
    pool.save()
  }

  // create the tracked contract based on the template
  PairTemplate.create(event.params.pair)
}
`
