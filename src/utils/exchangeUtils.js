
export const estimatedCost = (price = 0, cost = 0) => 1.01 * price * cost
export const tokenIdParser = token => token === '_' ? 'TRX' : token
