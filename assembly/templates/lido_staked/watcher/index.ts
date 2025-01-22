import { Address } from '@graphprotocol/graph-ts'
import { Lido } from '../generated/Lido/Lido'
import {
  activePositions,
  ActivePositionsResult,
  ADDRESS_ZERO,
  bytesToAddress
} from 'datai-sdk'
import { LidoUserPosition } from '../generated/schema'
import { WStEth } from '../generated/WStEth/WStEth'
import { StMatic } from '../generated/StMatic/StMatic'

export function GetActivePositions(): void {
  const lidoPosition = activePositions.inputPosition<LidoUserPosition>()
  const output = new ActivePositionsResult()

  const positionArray = lidoPosition.id.split('-')

  const userAddress = Address.fromString(positionArray[0])
  const positionType = positionArray[1]
  const tokenAddress = bytesToAddress(lidoPosition.tokenAddress)

  // Set results
  if (positionType == '0') {
    const lidoContract = Lido.bind(tokenAddress)
    const balance = lidoContract.try_balanceOf(userAddress)

    if (!balance.reverted) {
      output.setSupplyBalance(Address.fromString(ADDRESS_ZERO), balance.value)
      output.setPositionTokenBalance(tokenAddress, balance.value)
      output.poolAddress = tokenAddress
    }
  } else if (positionType == '1') {
    const wstEthContract = WStEth.bind(tokenAddress)
    const wstEthBalanceCall = wstEthContract.try_balanceOf(userAddress)

    if (!wstEthBalanceCall.reverted) {
      const balanceCall = wstEthContract.try_getStETHByWstETH(
        wstEthBalanceCall.value
      )

      if (!balanceCall.reverted) {
        output.setSupplyBalance(
          Address.fromString(ADDRESS_ZERO),
          balanceCall.value
        )
        output.setPositionTokenBalance(tokenAddress, wstEthBalanceCall.value)
        output.poolAddress = tokenAddress
      }
    }
  } else if (positionType == '2') {
    const stMaticContract = StMatic.bind(tokenAddress)
    const stMaticBalanceCall = stMaticContract.try_balanceOf(userAddress)

    if (!stMaticBalanceCall.reverted) {
      const balanceCall = stMaticContract.try_convertStMaticToMatic(
        stMaticBalanceCall.value
      )

      if (!balanceCall.reverted) {
        output.setSupplyBalance(
          stMaticContract.token(),
          balanceCall.value.getAmountInMatic()
        )
        output.setPositionTokenBalance(tokenAddress, stMaticBalanceCall.value)
        output.poolAddress = tokenAddress
      }
    }
  }

  activePositions.output(output)
}
