import { FIXED_TOKENS } from './constants'

export const orderBalances = balances => {
  let orderedBalances = []
  let rest = []

  balances.forEach(balance => {
    const verifiedIndex = FIXED_TOKENS.findIndex(token => token === balance.name)
    if (verifiedIndex > -1) {
      balance.verified = true
      orderedBalances[verifiedIndex] = balance
      return
    }
    rest.push(balance)
  })

  return [
    ...orderedBalances.filter(balance => balance),
    ...rest
  ]
}
