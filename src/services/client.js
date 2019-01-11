import axios from 'axios'
import Config from 'react-native-config'
import NodesIp from '../utils/nodeIp'
import sortBy from 'lodash/sortBy'
import { AUTH_ID } from './../../config'
import { getExchangeContentful } from './contentful/general'

export const ONE_TRX = 1000000

class ClientWallet {
  constructor (opt = null) {
    this.api = Config.MAIN_API_URL
    this.apiTest = Config.API_URL
    this.notifier = Config.NOTIFIER_API_URL
    this.tronwalletApi = Config.TRONWALLET_API
    this.tronwalletDB = Config.TRONWALLET_DB
    this.tronwalletExApi = Config.TRONWALLET_EX
    this.dbApiVersion = 3.0
    this.slsApiVersion = 2.0
  }

  //* ============TronScan Api============*//

  async getTronscanUrl () {
    const { isTestnet } = await NodesIp.getAllNodesIp()
    return isTestnet ? this.apiTest : this.api
  }

  async getTokenList (start, limit, id) {
    const { data: { data } } = await axios.get(
      `${Config.ASSET_API_URL}/token?sort=-name&limit=${limit}&start=${start}&id=${id}`
    )
    return data
  }

  //* ============TronWalletServerless Api============*//

  async getAccountData (address) {
    const apiUrl = this.tronwalletApi
    const { data: { balance, balances, frozen, bandwidth } } = await axios.get(`${apiUrl}/account/${address}`)

    const balancesData = balances.sort((a, b) => Number(b.balance) - Number(a.balance))
    const freezeData = { ...frozen, total: frozen.total / ONE_TRX, bandwidth }
    return { address, balancesData, freezeData, balanceTotal: balance / ONE_TRX }
  }

  async getBalances (address) {
    const apiUrl = this.tronwalletApi
    const { data: { balances } } = await axios.get(
      `${apiUrl}/account/${address}`
    )
    if (balances && balances.length > 1) {
      return balances.sort((a, b) => Number(b.balance) - Number(a.balance))
    }
    return balances
  }

  async getFreeze (address) {
    const { data: { frozen, bandwidth, balances } } = await axios.get(
      `${this.tronwalletApi}/account/${address}`
    )
    return { ...frozen, total: frozen.total / ONE_TRX, bandwidth, balances }
  }

  async giftUser (address, deviceId) {
    const body = { address, deviceId, authid: AUTH_ID }
    const { data: { result } } = await axios.post(`${this.tronwalletApi}/gift`, body)
    return result
  }

  async getTransactionsList (address) {
    const reqBody = { '$or': [{ 'toAddress': address }, { 'ownerAddress': address }], 'version': this.dbApiVersion }
    const { data: result } = await axios.post(`${this.tronwalletDB}/transactions/find`, reqBody)
    return result.map(tx =>
      tx.contractType <= 2
        ? {...tx, type: 'Transfer'}
        : {...tx, type: this.getContractType(tx.contractType)})
  }

  async getTransactionExchangesList (exchangeId) {
    const reqBody = { exchangeId }
    const { data: result } = await axios.post(`${this.tronwalletDB}/transactions/list/exchange`, reqBody)
    return result.slice(0, 40).map(tx => ({...tx, type: this.getContractType(tx.contractType)}))
  }

  async getTransactionByHash (hash, address) {
    const reqBody = { hash }
    const { data: result } = await axios.post(`${this.tronwalletDB}/transactions/find/`, reqBody)
    if (result.length) {
      const transactionDetail = result[0]
      return transactionDetail.contractType <= 2
        ? {...transactionDetail, type: 'Transfer', confirmed: true}
        : {...transactionDetail, type: this.getContractType(transactionDetail.contractType), confirmed: true}
    } else {
      return { confirmed: false }
    }
  }

  async getTransactionFromExchange ({address, asset, amount, bot}) {
    // TO-DO Check for AssetId instead of AssetName
    const reqBody = { 'toAddress': address, 'ownerAddress': bot, assetName: asset }
    const { data: result } = await axios.post(`${this.tronwalletDB}/transactions/find/`, reqBody)
    return result.length ? result[0] : null
  }

  async getAssetList () {
    const { data } = await axios.get(
      `${this.tronwalletApi}/asset/list`
    )
    return data
  }

  async getWitnessesList () {
    const apiUrl = this.tronwalletApi
    const { data: { totalVotes, voteList } } = await axios.get(`${apiUrl}/vote/list`)
    return { voteList, totalVotes }
  }

  async getExchangesList () {
    const [fullExchangeList, selectedExchangeList] = await Promise.all([
      axios.get(`${this.tronwalletExApi}/v2/list`),
      getExchangeContentful()
    ])
    let { data: exchangeList } = fullExchangeList
    const filteredExchangeList = exchangeList
      .map((ex) => {
        const exAvailable = selectedExchangeList.find(selectedEx => selectedEx.exchangeId === ex.exchangeId)
        return exAvailable ? {...ex, ...exAvailable} : ex
      })
    return sortBy(filteredExchangeList, [(ex) => ex.firstTokenId !== '1000018', (ex) => -(ex.variation || -999)])
  }

  async getExchangeById (id) {
    const { data: exchange } = await axios.post(`${this.tronwalletExApi}/v2`, {id})
    return exchange
  }

  async getTransactionDetails (tx) {
    const apiUrl = this.tronwalletApi
    const { data } = await axios.post(`${apiUrl}/transaction/detail`, { transaction: tx })
    return data
  }

  async broadcastTransaction (transactionSigned) {
    const reqBody = { transactionSigned }
    const { data: { result } } = await axios.post(
      `${this.tronwalletApi}/transaction/broadcast`,
      reqBody
    )
    return result
  }

  async getTransferTransaction ({ to, from, token, amount, data }) {
    const reqBody = {
      from,
      to,
      amount,
      token,
      data,
      version: this.slsApiVersion
    }
    const { data: { transaction } } = await axios.post(
      `${this.tronwalletApi}/unsigned/send`,
      reqBody
    )
    return transaction
  }

  async getFreezeTransaction (address, freezeAmount) {
    const reqBody = {
      address,
      freezeAmount,
      freezeDuration: 3
    }
    const { data: { transaction } } = await axios.post(
      `${this.tronwalletApi}/unsigned/freeze`,
      reqBody
    )
    return transaction
  }

  async getUnfreezeTransaction (address) {
    const reqBody = { address }
    const { data: { transaction } } = await axios.post(
      `${this.tronwalletApi}/unsigned/unfreeze`,
      reqBody
    )
    return transaction
  }

  async getParticipateTransaction (address, {
    participateAmount,
    participateToken,
    participateAddress
  }) {
    const reqBody = {
      address,
      participateAmount,
      participateToken,
      participateAddress,
      version: this.slsApiVersion
    }
    const { data: { transaction } } = await axios.post(
      `${this.tronwalletApi}/unsigned/participate`,
      reqBody
    )
    return transaction
  }

  async getVoteWitnessTransaction (address, votes) {
    const reqBody = { address, votes }
    const { data: { transaction } } = await axios.post(
      `${this.tronwalletApi}/unsigned/vote`,
      reqBody
    )
    return transaction
  }

  async getExchangeTransaction ({address, tokenId, exchangeId, quant, expected}) {
    const reqBody = { address, tokenId, exchangeId, quant, expected, version: 2.0 }
    const { data: { transaction } } = await axios.post(`${this.tronwalletExApi}/unsigned`, reqBody)
    return transaction
  }

  async registerDeviceForNotifications (deviceId, publicKey, removeExtraDeviceIds) {
    // TO-DO Review Serverless on this lambda
    try {
      const { data: { result } } = await axios.post(`${this.tronwalletApi}/user/put`, { deviceId, publicKey, refresh: removeExtraDeviceIds })
      return result
    } catch (error) {
      return false
    }
  }

  async notifyNewTransactions (id, transactions) {
    return axios.post(`${this.tronwalletApi}/notify`, { id, transactions })
  }

  async getDevicesFromPublicKey (publicKey) {
    return axios.get(`${this.tronwalletApi}/user/${publicKey}`)
  }

  getContractType = number => {
    switch (number) {
      case 1:
        return 'Transfer'
      case 2:
        return 'Transfer Asset'
      case 4:
        return 'Vote'
      case 6:
        return 'Create'
      case 9:
        return 'Participate'
      case 11:
        return 'Freeze'
      case 12:
        return 'Unfreeze'
      case 44:
        return 'Exchange'
      default:
        return 'Unregistred Name'
    }
  }
}

export default new ClientWallet()
