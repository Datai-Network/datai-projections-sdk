import { Address, BigInt } from '@graphprotocol/graph-ts'
import { Dsp } from '../generated/templates/Dsp/Dsp'
import {
  activePositions,
  ActivePositionsResult,
  BI_0,
  bytesToAddress
} from 'datai-sdk'
import { DodoDsp, DodoUserPosition } from '../generated/schema'
import { ERC20 } from '../../../libs/templates/ERC20'

export function GetActivePositions(): void {
  const dodoPosition = activePositions.inputPosition<DodoUserPosition>()
  const output = new ActivePositionsResult()

  const dodoUserPosition = DodoUserPosition.load(dodoPosition.id)
  if (dodoUserPosition == null) {
    console.error('Position is not registered!')
    throw new Error('Position' + dodoPosition.id + 'is not registered!')
  }

  const userAddress = Address.fromString(dodoUserPosition.id.split('-')[0])
  const dspAddress = Address.fromString(dodoUserPosition.id.split('-')[1])
  const dsp = DodoDsp.load(dspAddress.toHexString())
  if (dsp == null) {
    console.error('Dsp is not registered!')
    throw new Error('Dsp' + dspAddress.toHexString() + 'is not registered!')
  }

  const sharesBalance = getSharesBalance(userAddress, dspAddress)
  const underlyingBalances = getUnderlyingBalances(
    dspAddress,
    bytesToAddress(dsp.tokenBase),
    bytesToAddress(dsp.tokenQuote),
    sharesBalance
  )

  // Set results
  output.setSupplyBalance(bytesToAddress(dsp.tokenBase), underlyingBalances[0])
  output.setSupplyBalance(bytesToAddress(dsp.tokenQuote), underlyingBalances[1])
  output.setPositionTokenBalance(dspAddress, sharesBalance)
  output.poolAddress = dspAddress

  activePositions.output(output)
}

function getSharesBalance(user: Address, dspAddress: Address): BigInt {
  const dspContract = Dsp.bind(dspAddress)
  const userBalance = dspContract.try_balanceOf(user)

  if (userBalance.reverted) {
    return BI_0
  }

  return userBalance.value
}

function getUnderlyingBalances(
  dspAddress: Address,
  baseAddress: Address,
  quoteAddress: Address,
  sharesBalance: BigInt
): Array<BigInt> {
  const baseBalance = ERC20.bind(baseAddress).balanceOf(dspAddress)
  const quoteBalance = ERC20.bind(quoteAddress).balanceOf(dspAddress)
  const totalShares = Dsp.bind(dspAddress).totalSupply()

  const baseAmount = baseBalance.times(sharesBalance).div(totalShares)
  const quoteAmount = quoteBalance.times(sharesBalance).div(totalShares)

  return [baseAmount, quoteAmount]
}
