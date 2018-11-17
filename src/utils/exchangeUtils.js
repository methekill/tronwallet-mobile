import { ONE_TRX } from '../services/client'

export const estimatedCost = (price = 0, quant = 0, high = true) => (high ? 1.01 : 0.99) * price * quant
export const tokenIdParser = token => token === '_' ? 'TRX' : token

export const estimatedBuyCost = (price = 0, quant = 0, isTrx, trueParse) =>
  isTrx
    ? (1.01 * price * quant).toFixed(4) * (trueParse ? ONE_TRX : 1)
    : Math.ceil(price * quant).toString()

export const estimatedSellCost = (price = 0, quant = 0, isTrx, trueParse) =>
  isTrx
    ? (0.99 * price * quant).toFixed(4) * (trueParse ? ONE_TRX : 1)
    : Math.floor(price * quant).toString()
