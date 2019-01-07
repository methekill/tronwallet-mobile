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
  let orderedBalances = []
  let rest = []

  balances.forEach(balance => {
    const verifiedIndex = fixedTokens.findIndex(({id: tokenID}) => tokenID === balance.id)
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

export const parseFixedTokens = (tokens) => tokens.map(({name, id}) => ({ name, balance: 0, id }))
