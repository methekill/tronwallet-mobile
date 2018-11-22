
const signTransaction = (privateKey, transactionUnsigned) => {
  return new Promise((resolve, reject) => {
    if (privateKey !== 'valid key' || !transactionUnsigned) {
      reject('signTransaction error')
    }
    resolve('signTransaction success')
  })
}

export default {
  signTransaction
}
