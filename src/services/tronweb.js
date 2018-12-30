import TronWeb from 'tronweb'

import { AsyncStorage } from 'react-native'
import { AUTOSIGN_LIST } from '../utils/constants'

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

// AutoSign Core

export const checkAutoContract = async (contract) => {
  try {
    const list = JSON.parse(await AsyncStorage.getItem(AUTOSIGN_LIST))

    if (!list) {
      await AsyncStorage.setItem(AUTOSIGN_LIST, JSON.stringify([]))
      return false
    }

    if (list && list.length > 0) {
      return list.find(c => {
        if (c.address === contract.address && c.command === contract.command) {
          return true
        }
      })
    }

    return false
  } catch (e) {
    console.error(e)
  }
}

export const addToAutoContract = async (contract, autoSign) => {
  try {
    const list = JSON.parse(await AsyncStorage.getItem(AUTOSIGN_LIST))
    list.push({ ...contract, autoSign, createdAt: new Date() })
  } catch (e) {
    console.error(e)
  }
}
