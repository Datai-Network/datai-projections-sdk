import { Address, BigInt } from '@graphprotocol/graph-ts'
import { PoolCreated } from '../../generated/Factory/Factory'
import { Uniswap3Pool, Uniswap3Token } from '../../generated/schema'
import { ERC20 } from '../../generated/Factory/ERC20'
import { BI_18 } from 'datai-sdk'

export function handlePoolCreated(event: PoolCreated): void {
  let token0 = Uniswap3Token.load(event.params.token0.toHexString())
  let token1 = Uniswap3Token.load(event.params.token1.toHexString())

  if (token0 === null) {
    token0 = new Uniswap3Token(event.params.token0.toHexString())
    const decimals0 = getTokenDecimals(event.params.token0)
    token0.decimals = decimals0
  }

  if (token1 === null) {
    token1 = new Uniswap3Token(event.params.token1.toHexString())
    const decimals1 = getTokenDecimals(event.params.token1)
    token1.decimals = decimals1
  }
  const pool = new Uniswap3Pool(
    token0.id + '-' + token1.id + '-' + event.params.fee.toString()
  ) as Uniswap3Pool

  pool.poolAddress = event.params.pool
  pool.token0 = token0.id
  pool.token1 = token1.id
  pool.feeTier = BigInt.fromI32(event.params.fee)

  pool.save()
  token0.save()
  token1.save()
}

function getTokenDecimals(tokenAddress: Address): BigInt {
  const tokenContract = ERC20.bind(tokenAddress)
  const result = tokenContract.tryCall('decimals', 'decimals():(uint8)', [])

  if (result.reverted) {
    return BI_18
  }

  return result.value[0].toBigInt()
}
