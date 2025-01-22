import { Address, BigDecimal, BigInt } from '@graphprotocol/graph-ts'
import {
  IncreaseLiquidity,
  Transfer
} from '../../generated/PositionManager/PositionManager'
import { PositionManager } from '../../generated/PositionManager/PositionManager'
import { Factory } from '../../generated/Factory/Factory'
import {
  Uniswap3Contracts,
  Uniswap3Pool,
  Uniswap3UserPosition
} from '../../generated/schema'
import {
  ensureUpdateTrigger,
  registerUser,
  ADDRESS_ZERO,
  bytesToAddress,
  pow
} from 'datai-sdk'

export function handleIncreaseLiquidity(event: IncreaseLiquidity): void {
  // Protocol logic
  registerContracts(event.address)

  const position = getPosition(event.params.tokenId)

  if (position == null) {
    return
  }

  // If trigger exists do nothing
  if (ensureUpdateTrigger(event.params.tokenId.toString(), position.user)) {
    return
  }

  // Register User
  registerUser(position.user)
}

export function handleTransfer(event: Transfer): void {
  // Protocol logic
  registerContracts(event.address)

  const position = getPosition(event.params.tokenId)
  if (position == null) {
    return
  }

  position.user = event.params.to.toHexString()
  position.save()

  // Register User
  registerUser(position.user)
}

function getPosition(tokenId: BigInt): Uniswap3UserPosition | null {
  let position = Uniswap3UserPosition.load(tokenId.toString())
  if (position == null) {
    const uniswap3Contracts = Uniswap3Contracts.load('id')!
    const contract = PositionManager.bind(
      bytesToAddress(uniswap3Contracts.positionManager)
    )
    const positionCall = contract.try_positions(tokenId)
    if (positionCall.reverted) {
      return null
    }

    let pool = Uniswap3Pool.load(
      positionCall.value.value2.toHexString() +
        '-' +
        positionCall.value.value3.toHexString() +
        '-' +
        positionCall.value.value4.toString()
    )
    if (!pool) {
      const factoryContract = Factory.bind(
        bytesToAddress(Uniswap3Contracts.load('id')!.factory)
      )

      pool = new Uniswap3Pool(
        positionCall.value.value2.toHexString() +
          '-' +
          positionCall.value.value3.toHexString() +
          '-' +
          positionCall.value.value4.toString()
      )
      pool.token0 = positionCall.value.value2.toHexString()
      pool.token1 = positionCall.value.value3.toHexString()
      pool.poolAddress = factoryContract.getPool(
        positionCall.value.value2,
        positionCall.value.value3,
        positionCall.value.value4
      )
      pool.feeTier = BigInt.fromI32(positionCall.value.value4)

      pool.save()
    }

    position = new Uniswap3UserPosition(tokenId.toString())
    // The owner gets correctly updated in the Transfer handler
    position.user = ADDRESS_ZERO
    position.pool = pool.poolAddress.toHexString()
    position.tokenId = tokenId
    position.token0 = positionCall.value.value2.toHexString()
    position.token1 = positionCall.value.value3.toHexString()
    position.tickLowerPrice = pow(
      BigDecimal.fromString('1.0001'),
      positionCall.value.value5
    )
    position.tickUpperPrice = pow(
      BigDecimal.fromString('1.0001'),
      positionCall.value.value6
    )
  }

  return position
}

function registerContracts(positionManagerAddress: Address): void {
  let contracts = Uniswap3Contracts.load('id')
  if (!contracts) {
    const positionManager = PositionManager.bind(positionManagerAddress)

    contracts = new Uniswap3Contracts('id')
    contracts.positionManager = positionManagerAddress
    contracts.factory = positionManager.factory()
    contracts.save()
  }
}
