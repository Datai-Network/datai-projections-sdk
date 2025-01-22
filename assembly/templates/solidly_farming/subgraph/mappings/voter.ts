import { SolidlyGauge as GaugeTemplate } from '../../generated/templates'
import { SolidlyPair } from '../../generated/SolidlyVoter/SolidlyPair'
import { GaugeCreated } from '../../generated/SolidlyVoter/SolidlyVoter'
import { SolidlyGauge } from '../../generated/schema'

export function handleGaugeCreated(event: GaugeCreated): void {
  // Store some entities
  let gauge = SolidlyGauge.load(event.params.gauge.toHexString())
  if (gauge == null) {
    const pairContract = SolidlyPair.bind(event.params.pool)

    gauge = new SolidlyGauge(event.params.gauge.toHexString())
    gauge.gauge = event.params.gauge
    gauge.pool = event.params.pool
    gauge.token0 = pairContract.token0()
    gauge.token1 = pairContract.token1()
    gauge.save()
  }

  // create the tracked contract based on the template
  GaugeTemplate.create(event.params.gauge)
}
