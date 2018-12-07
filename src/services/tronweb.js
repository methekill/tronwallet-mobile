import TronWeb from 'tronweb'

const HttpProvider = TronWeb.providers.HttpProvider
const fullNode = new HttpProvider('https://api.trongrid.io') // Full node http endpoint
const solidityNode = new HttpProvider('https://api.trongrid.io') // Solidity node http endpoint
const eventServer = 'https://api.trongrid.io' // Contract events http endpoint

const tronWeb = new TronWeb(
  fullNode,
  solidityNode,
  eventServer
)

export const triggerSmartContract = ({ address, command, params, feeLimit, issuer, amount }) => {
  return new Promise((resolve, reject) => {
    tronWeb.transactionBuilder.triggerSmartContract(
      address,
      command,
      feeLimit || 30000,
      amount,
      params,
      issuer,
      (err, transaction) => {
        if (err) { return reject(err) }

        resolve(transaction)
      })
  })
}

export const signSmartContract = async (transaction, pk) => {
  return tronWeb.trx.sign(transaction, pk)
}

export const submitSmartContract = async (tr) => {
  return tronWeb.trx.sendRawTransaction(tr)
}
