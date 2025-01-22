import { Transfer } from '../../generated/EETH/EETH'
import { EtherfiUserPosition } from '../../generated/schema'
import { registerUser, ensureUpdateTrigger } from 'datai-sdk'
import { Bytes } from '@graphprotocol/graph-ts'
import { ADDRESS_ZERO } from 'datai-sdk'
import { sETHFI } from '../constants'

export function handleTransfer(event: Transfer): void {
  // Ids
  const userId = event.params.to.toHexString()
  const tokenId = event.address.toHexString()
  const positionId = userId + '-' + tokenId

  // If trigger exists do nothing
  if (ensureUpdateTrigger(positionId, userId)) {
    return
  }

  // Protocol logic
  let etherfiUserPosition = EtherfiUserPosition.load(positionId)
  if (etherfiUserPosition == null) {
    etherfiUserPosition = new EtherfiUserPosition(positionId)
    etherfiUserPosition.user = userId

    if (event.address == sETHFI) {
      etherfiUserPosition.underlyingToken = Bytes.fromHexString(
        '0xfe0c30065b384f05761f15d0cc899d4f9f9cc0eb'
      )
    } else {
      etherfiUserPosition.underlyingToken = Bytes.fromHexString(ADDRESS_ZERO)
    }

    etherfiUserPosition.save()
  }

  // Register User
  registerUser(userId)
}
