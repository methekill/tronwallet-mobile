import { WALLET_TOKENS } from './constants'
// Deprecated
// export const orderBalances = (balances, fixedTokens) => {
//   let orderedBalances = []
//   let rest = []

//   balances.forEach(balance => {
//     const verifiedIndex = fixedTokens.findIndex(token => token === balance.name)
//     if (verifiedIndex > -1) {
//       balance.verified = true
//       orderedBalances[verifiedIndex] = balance
//       return
//     }
//     rest.push(balance)
//   })

//   return [
//     ...orderedBalances.filter(balance => balance),
//     ...rest
//   ]
// }

export const orderBalancesV2 = (balances, fixedTokens) => {
  const fixedBalancesIds = fixedTokens.map(tkn => tkn.id)
  const fixedWalletIds = WALLET_TOKENS.map(tkn => tkn.id)
  let orderedBalances = []
  let rest = []

  balances.forEach(balance => {
    const verifiedIndex = fixedBalancesIds.indexOf(balance.id)
    if (verifiedIndex > -1) {
      balance.verified = true
      orderedBalances[verifiedIndex] = balance
      return
    }
    rest.push(balance)
  })

  return [
    ...orderedBalances,
    ...rest
  ].filter(tkn => (tkn && (tkn.balance > 0 || fixedWalletIds.indexOf(tkn.id) > -1)))
}

export const parseFixedTokens = (tokens) => tokens.map(({name, id}) => ({ name, balance: 0, id }))
