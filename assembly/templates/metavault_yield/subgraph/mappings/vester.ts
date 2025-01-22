import { Address } from '@graphprotocol/graph-ts'
import { ensureUpdateTrigger, registerUser } from 'datai-sdk'
import { VesterTokens, VesterUserPosition } from '../../generated/schema'
import { Transfer } from '../../generated/Vester/Vester'
import { Vester } from '../../generated/Vester/Vester'

export function handleTransfer(event: Transfer): void {
  // Ids
  const userId = event.params.to.toHexString()
  const positionId = userId + '-' + event.address.toHexString()

  // If trigger exists do nothing
  if (ensureUpdateTrigger(positionId, userId)) {
    return
  }

  // Protocol logic
  let vesterUserPosition = VesterUserPosition.load(positionId)
  if (vesterUserPosition == null) {
    vesterUserPosition = new VesterUserPosition(positionId)
    vesterUserPosition.user = userId
    vesterUserPosition.save()
  }

  // Register Claimable token
  registerTokens(event.address)

  // Register User
  registerUser(userId)
}

function registerTokens(vester: Address): void {
  let vesterTokens = VesterTokens.load(vester.toHexString())
  if (vesterTokens == null) {
    const vesterContract = Vester.bind(vester)
    const underlyingToken = vesterContract.esToken()
    const claimableToken = vesterContract.claimableToken()

    vesterTokens = new VesterTokens(vester.toHexString())
    vesterTokens.underlyingToken = underlyingToken
    vesterTokens.claimableToken = claimableToken
    vesterTokens.save()
  }
}
