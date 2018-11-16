
export const estimatedCost = (price = 0, quant = 0, high = true) => (high ? 1.01 : 0.99) * price * quant
export const tokenIdParser = token => token === '_' ? 'TRX' : token
