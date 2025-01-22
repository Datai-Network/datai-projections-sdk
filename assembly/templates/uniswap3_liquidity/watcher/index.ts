import { Address, BigInt, BigDecimal, ethereum } from '@graphprotocol/graph-ts'
import {
  activePositions,
  ActivePositionsResult,
  ADDRESS_ZERO,
  BD_0,
  BI_0,
  BI_1,
  BI_18,
  BI_2,
  exponentToBigDecimal,
  squareRoot,
  floor,
  bytesToAddress
} from 'datai-sdk'

import {
  Uniswap3Contracts,
  Uniswap3Token,
  Uniswap3UserPosition
} from '../generated/schema'
import {
  PositionManager__collectInputParamsStruct,
  PositionManager
} from '../generated/PositionManager/PositionManager'

import { Pool } from '../generated/PositionManager/Pool'

export function GetActivePositions(): void {
  const uniswap3Position = activePositions.inputPosition<Uniswap3UserPosition>()
  const output = new ActivePositionsResult()

  // Calculations
  const positionManagerAddress = bytesToAddress(
    Uniswap3Contracts.load('id')!.positionManager
  )

  const userPosition = Uniswap3UserPosition.load(uniswap3Position.id)
  if (userPosition == null) {
    throw new Error(`Position ${uniswap3Position.id} is not registered!`)
  }

  // Init
  let balance0 = BI_0
  let balance1 = BI_0
  let rewardBalances = [BI_0, BI_0]

  // Only recalculate if NFT was not transferred to someone else
  if (
    getOwner(userPosition.tokenId, positionManagerAddress) ==
    Address.fromString(userPosition.user)
  ) {
    const liquidity = getLiquidity(userPosition.tokenId, positionManagerAddress)
    const tokenDecimals = getTokenDecimals(
      userPosition.token0,
      userPosition.token1
    )
    const minPrice = userPosition.tickLowerPrice.times(
      exponentToBigDecimal(tokenDecimals[0].minus(tokenDecimals[1]).toI32())
    )
    const maxPrice = userPosition.tickUpperPrice.times(
      exponentToBigDecimal(tokenDecimals[0].minus(tokenDecimals[1]).toI32())
    )
    const currentPrice = getCurrentPrice(
      Address.fromString(userPosition.pool),
      tokenDecimals[0],
      tokenDecimals[1]
    )

    balance0 = getPositionAmount0(
      liquidity,
      minPrice,
      maxPrice,
      currentPrice,
      tokenDecimals[0],
      tokenDecimals[1]
    )
    balance1 = getPositionAmount1(
      liquidity,
      minPrice,
      maxPrice,
      currentPrice,
      tokenDecimals[0],
      tokenDecimals[1]
    )

    rewardBalances = getClaimableBalances(
      userPosition.tokenId,
      Address.fromString(userPosition.user),
      positionManagerAddress
    )
  }

  // Set results
  output.setSupplyBalance(Address.fromString(userPosition.token0), balance0)
  output.setSupplyBalance(Address.fromString(userPosition.token1), balance1)
  output.setPositionTokenBalance(
    positionManagerAddress,
    BI_1,
    userPosition.tokenId
  )
  output.setRewardBalance(
    Address.fromString(userPosition.token0),
    rewardBalances[0]
  )
  output.setRewardBalance(
    Address.fromString(userPosition.token1),
    rewardBalances[1]
  )
  output.poolAddress = Address.fromString(userPosition.pool)

  activePositions.output(output)
}

function getOwner(tokenId: BigInt, positionManagerAddress: Address): Address {
  const positionManager = PositionManager.bind(positionManagerAddress)

  const ownerOfCall = positionManager.try_ownerOf(tokenId)
  if (ownerOfCall.reverted) {
    return Address.fromString(ADDRESS_ZERO)
  }

  return ownerOfCall.value
}

function getLiquidity(
  tokenId: BigInt,
  positionManagerAddress: Address
): BigInt {
  const positionManager = PositionManager.bind(positionManagerAddress)
  const positionCall = positionManager.try_positions(tokenId)
  if (positionCall.reverted) {
    return BI_0
  }

  return positionCall.value.value7
}

function getTokenDecimals(
  token0Address: string,
  token1Address: string
): BigInt[] {
  const token0 = Uniswap3Token.load(token0Address)
  const token1 = Uniswap3Token.load(token1Address)

  const decimals0 = token0 != null ? token0.decimals : BI_18
  const decimals1 = token1 != null ? token1.decimals : BI_18

  return [decimals0, decimals1]
}

function getPositionAmount0(
  liquidity: BigInt,
  minPrice: BigDecimal,
  maxPrice: BigDecimal,
  currentPrice: BigDecimal,
  decimals0: BigInt,
  decimals1: BigInt
): BigInt {
  const scaleDecimals = squareRoot(
    exponentToBigDecimal(decimals0.toI32() + decimals1.toI32())
  )

  if (currentPrice.equals(BD_0)) {
    return BI_0
  } else if (currentPrice.le(minPrice)) {
    return floor(
      liquidity
        .toBigDecimal()
        .times(exponentToBigDecimal(decimals0.toI32()))
        .times(squareRoot(maxPrice).minus(squareRoot(minPrice)))
        .div(squareRoot(maxPrice).times(squareRoot(minPrice)))
        .div(scaleDecimals)
    )
  } else if (currentPrice.ge(maxPrice)) {
    return BI_0
  } else {
    return floor(
      liquidity
        .toBigDecimal()
        .times(exponentToBigDecimal(decimals0.toI32()))
        .times(squareRoot(maxPrice).minus(squareRoot(currentPrice)))
        .div(squareRoot(maxPrice).times(squareRoot(currentPrice)))
        .div(scaleDecimals)
    )
  }
}

function getPositionAmount1(
  liquidity: BigInt,
  minPrice: BigDecimal,
  maxPrice: BigDecimal,
  currentPrice: BigDecimal,
  decimals0: BigInt,
  decimals1: BigInt
): BigInt {
  const scaleDecimals = squareRoot(
    exponentToBigDecimal(decimals0.toI32() + decimals1.toI32())
  )

  if (currentPrice.le(minPrice)) {
    return BigInt.zero()
  } else if (currentPrice.ge(maxPrice)) {
    return floor(
      liquidity
        .toBigDecimal()
        .times(exponentToBigDecimal(decimals1.toI32()))
        .times(squareRoot(maxPrice).minus(squareRoot(minPrice)))
        .div(scaleDecimals)
    )
  } else {
    return floor(
      liquidity
        .toBigDecimal()
        .times(exponentToBigDecimal(decimals1.toI32()))
        .times(squareRoot(currentPrice).minus(squareRoot(minPrice)))
        .div(scaleDecimals)
    )
  }
}

function getCurrentPrice(
  poolAddress: Address,
  decimals0: BigInt,
  decimals1: BigInt
): BigDecimal {
  const poolContract = Pool.bind(poolAddress)
  const sqrtPriceX96 = poolContract.slot0().getSqrtPriceX96().toBigDecimal()
  const Q192 = BI_2.pow(192).toBigDecimal()
  return sqrtPriceX96
    .times(sqrtPriceX96)
    .div(Q192)
    .times(exponentToBigDecimal(decimals0.toI32()))
    .div(exponentToBigDecimal(decimals1.toI32()))
}

function getClaimableBalances(
  tokenId: BigInt,
  user: Address,
  positionManagerAddress: Address
): BigInt[] {
  const positionManager = PositionManager.bind(positionManagerAddress)

  const maxUint128 = BigInt.fromI32(2).pow(128).minus(BigInt.fromI32(1))

  const collectParams = [
    ethereum.Value.fromUnsignedBigInt(tokenId),
    ethereum.Value.fromAddress(user),
    ethereum.Value.fromUnsignedBigInt(maxUint128),
    ethereum.Value.fromUnsignedBigInt(maxUint128)
  ]

  const collectCall = positionManager.try_collect(
    changetype<PositionManager__collectInputParamsStruct>(collectParams)
  )
  if (collectCall.reverted) {
    return [BI_0, BI_0]
  }

  return [collectCall.value.getAmount0(), collectCall.value.getAmount1()]
}
