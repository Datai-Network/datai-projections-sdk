import { NewDSP } from '../../generated/DspFactory/DspFactory'
import { DodoDsp } from '../../generated/schema'
import { Dsp as DspTemplate } from '../../generated/templates'

export function handleNewDSP(event: NewDSP): void {
  // Store some entities
  let dsp = DodoDsp.load(event.params.DSP.toHexString())
  if (dsp == null) {
    dsp = new DodoDsp(event.params.DSP.toHexString())
    dsp.tokenBase = event.params.baseToken
    dsp.tokenQuote = event.params.quoteToken
    dsp.save()
  }

  // create the tracked contract based on the template
  DspTemplate.create(event.params.DSP)
}
