import { Address } from '@graphprotocol/graph-ts'
import { Compound2Market } from '../../generated/schema'
import { MarketListed } from '../../generated/Comptroller/Comptroller'
import { CToken as CTokenTemplate } from '../../generated/templates'
import { CToken } from '../../generated/templates/CToken/CToken'

export function handleMarketListed(event: MarketListed): void {
  // Create dataSource
  CTokenTemplate.create(event.params.cToken)

  // Register Market entity
  registerMarket(event.params.cToken)
}

// Registers Market entity
function registerMarket(cToken: Address): void {
  let market = Compound2Market.load(cToken.toHexString())
  if (market == null) {
    const cTokenContract = CToken.bind(cToken)
    const underlyingAddressCall = cTokenContract.try_underlying()

    market = new Compound2Market(cToken.toHexString())
    market.underlyingAddress = underlyingAddressCall.reverted
      ? Address.zero()
      : underlyingAddressCall.value
    market.save()
  }
}
