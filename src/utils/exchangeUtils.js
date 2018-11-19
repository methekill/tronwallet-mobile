import { ONE_TRX } from '../services/client'

const SELL_VARIATION = 0.99
const BUY_VARIATION = 1.01

export const estimatedBuyCost = (price = 0, quant = 0, isTrx, parsed = false) =>
  isTrx
    ? (BUY_VARIATION * price * quant).toFixed(4) * (parsed ? ONE_TRX : 1)
    : Math.ceil(price * quant * BUY_VARIATION).toString()

export const expectedBuy = (value, isTrx) => Math.round((isTrx ? ONE_TRX : 1) * value)

export const estimatedSellCost = (price = 0, quant = 0, isTrx, parsed = false) =>
  isTrx
    ? (SELL_VARIATION * price * quant).toFixed(4) * (parsed ? ONE_TRX : 1)
    : Math.floor(price * quant * SELL_VARIATION).toString()

export const expectedSell = (value, isTrx) => Math.round((isTrx ? ONE_TRX : 1) * value)
