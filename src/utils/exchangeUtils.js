import { ONE_TRX } from '../services/client'

export const LOW_VARIATION = 0.99
export const HIGH_VARIATION = 1.01

/* GOTRON FORMULA */
const exchangeToSupply = (supply, balance, quant) => {
  let newBalance = balance + quant
  let issuedSupply = (-supply * (1.0 - Math.pow((1.0 + (quant / newBalance)), 0.0005)))
  return { supply: supply + issuedSupply, relay: issuedSupply }
}

const exchangeFromSupply = (supply, balance, supplyQuant) => {
  supply = supply - supplyQuant

  let exchangeBalance = balance * (Math.pow(1.0 + (supplyQuant / supply), 2000.0) - 1.0)

  return exchangeBalance
}

export const calcExchangePrice = (firstBalance, secondBalance, quant, parseTrx = false) => {
  let supply = 1000000000000000000
  quant = parseFloat(quant)
  let { supply: newSupply, relay } = exchangeToSupply(supply, firstBalance, quant)
  let estimatedCost = exchangeFromSupply(newSupply, secondBalance, relay) / (parseTrx ? ONE_TRX : 1)

  return estimatedCost
}
/* GOTRON FORMULA */

export const estimatedBuyCost = (firstBalance, secondBalance, quant, parseTrx = false) => {
  const cost = calcExchangePrice(firstBalance, secondBalance, quant, parseTrx)
  return parseTrx
    ? cost * HIGH_VARIATION
    : Math.ceil(cost * HIGH_VARIATION)
}

export const estimatedBuyWanted = (firstBalance, secondBalance, quant, parseTrx = false) => (
  Math.round(calcExchangePrice(secondBalance, firstBalance, quant) * 0.997) // Don't know why but 0.997 is working for now
)

export const estimatedSellCost = (firstBalance, secondBalance, quant, parseTrx = false) => {
  const cost = calcExchangePrice(firstBalance, secondBalance, quant, parseTrx)
  return parseTrx
    ? cost * LOW_VARIATION
    : Math.floor(cost * LOW_VARIATION)
}

export const trxValueParse = (value, isTrx) => Math.round((isTrx ? ONE_TRX : 1) * value)

export const getInputType = tokenId => tokenId === '_' ? 'float' : 'int'
