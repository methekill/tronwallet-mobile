import axios from 'axios'
import Config from 'react-native-config'
import { Auth } from 'aws-amplify'
import NodesIp from '../utils/nodeIp'
export const ONE_TRX = 1000000

class ClientWallet {
  constructor(opt = null) {
    this.api = Config.MAIN_API_URL
    this.notifier = Config.NOTIFIER_API_URL
    this.tronwalletApi = Config.TRON_WALLET_API_URL
  }

  //*============AWS Functions============*//
  setUserPk = async (publickey) => {
    const user = await Auth.currentAuthenticatedUser()
    return Auth.updateUserAttributes(user, {
      'custom:publickey': publickey
    })
  };

  getUserAttributes = async () => {
    try {
      const authenticatedUser = await Auth.currentAuthenticatedUser()
      const userAttributes = await Auth.userAttributes(authenticatedUser)
      const user = {}
      for (const attribute of userAttributes) {
        user[attribute.Name] = attribute.Value
      }
      return user
    } catch (error) {
      if (error.code === 'UserNotFoundException' || error === 'not authenticated') {
        throw new Error(error.message || error) // TODO redirect to login screen
      }
    }
  };

  getPublicKey = async () => {
    try {
      const userAttr = await this.getUserAttributes()
      return userAttr['custom:publickey']
    } catch (error) {
      throw new Error(error.message || error)
    }
  };

  //*============TronScan Api============*//
  async getTotalVotes() {
    const { data } = await axios.get(`${this.api}/vote/current-cycle`)
    const totalVotes = data.total_votes
    const candidates = data.candidates
    return { totalVotes, candidates }
  }

  async getTransactionDetails(tx) {
    try {
      const { data: { transaction } } = await axios.post(`${this.api}/transaction?dry-run`, {
        transaction: tx
      })
      return transaction
    } catch (error) {
      throw new Error(error.message || error)
    }
  }
  async getBalances() {
    const owner = await this.getPublicKey()
    const { data: { balances } } = await axios.get(`${this.api}/account/${owner}`)
    const sortedBalances = balances.sort((a, b) => (Number(b.balance) - Number(a.balance)))
    return sortedBalances
  }

  async getFreeze() {
    const owner = await this.getPublicKey()
    const { data: { frozen, bandwidth, balances } } = await axios.get(`${this.api}/account/${owner}`)
    return { ...frozen, total: frozen.total / ONE_TRX, bandwidth, balances }
  }

  async getUserVotes() {
    const owner = await this.getPublicKey()
    const { data: { votes } } = await axios.get(`${this.api}/account/${owner}/votes`)
    return votes
  }


  async getTokenList() {
    try {
      const { data: { data } } = await axios.get(`${this.api}/token?sort=-name&start=0&status=ico`)
      return data
    } catch (error) {
      throw new Error(error.message || error)
    }
  }

  async getTransactionList() {
    const owner = await this.getPublicKey()
    const tx = () => axios.get(`${this.api}/transaction?sort=-timestamp&limit=50&address=${owner}`)
    const tf = () => axios.get(`${this.api}/transfer?sort=-timestamp&limit=50&address=${owner}`)
    const transactions = await Promise.all([tx(), tf()])
    const txs = transactions[0].data.data.filter(d => d.contractType !== 1)
    const trfs = transactions[1].data.data.map(d => ({ ...d, contractType: 1, ownerAddress: owner }))
    let sortedTxs = [...txs, ...trfs].sort((a, b) => (b.timestamp - a.timestamp))
    sortedTxs = sortedTxs.map(transaction => ({
      type: this.getContractType(transaction.contractType),
      ...transaction
    }))
    console.log(">>>", sortedTxs)
    return sortedTxs
  }

  //*============TronWalletServerless Api============*//
  async getAssetList() {
    const { nodeIp } = await NodesIp.getAllNodesIp()
    try {
      const { data } = await axios.get(`${this.tronwalletApi}/vote/list?node=${node}`)
      return data;
    } catch (error) {
      throw new Error(error.message || error)
    }
  }

  async broadcastTransaction(transactionSigned) {
    const { nodeIp } = await NodesIp.getAllNodesIp()
    const reqBody = {
      transactionSigned,
      node: nodeIp,
    }
    try {
      const { data: { result } } = await axios.post(`${this.tronwalletApi}/transaction/broadcast`, reqBody);
      return result;
    } catch (err) {
      const { data: { error } } = err.response;
      throw new Error(error);
    }
  }

  async getTransferTransaction({ to, from, token, amount }) {
    const { nodeIp } = await NodesIp.getAllNodesIp()
    const reqBody = {
      from,
      to,
      amount,
      token,
      node: nodeIp,
    }
    try {
      const { data: { transaction } } = await axios.post(`${this.tronwalletApi}/unsigned/send`, reqBody)
      return transaction
    } catch (error) {
      console.warn(error.response)
      throw new Error(error.message || error)
    }
  }

  async getFreezeTransaction(freezeAmount) {
    const address = await this.getPublicKey()
    const { nodeIp } = await NodesIp.getAllNodesIp()
    const reqBody = {
      address,
      freezeAmount,
      freezeDuration: 3,
      node: nodeIp,
    }
    try {
      const { data: { transaction } } = await axios.post(`${this.tronwalletApi}/unsigned/freeze`, reqBody)
      return transaction;
    } catch (error) {
      console.warn(error.response)
      throw new Error(error.message || error)
    }
  }

  async getParticipateTransaction({ participateAmount, participateToken, participateAddress }) {
    const address = await this.getPublicKey();
    const { nodeIp } = await NodesIp.getAllNodesIp()
    const reqBody = {
      address,
      participateAmount,
      participateToken,
      participateAddress,
      node: nodeIp,
    }
    try {
      const { data: { transaction } } = await axios.post(`${this.tronwalletApi}/unsigned/participate`, reqBody)
      return transaction;
    } catch (error) {
      console.warn(error)
      console.warn(error.response)
      throw new Error(error.message || error)
    }
  }

  async getVoteWitnessTransaction(votes) {
    const address = await this.getPublicKey();
    const { nodeIp } = await NodesIp.getAllNodesIp()
    const reqBody = {
      address,
      votes,
      node: nodeIp,
    }
    try {
      const { data: { transaction } } = await axios.post(`${this.tronwalletApi}/unsigned/vote`, reqBody)
      return transaction;
    } catch (error) {
      console.warn(error.response)
      throw new Error(error.message || error)
    }
  }

  getContractType = (number) => {
    switch (number) {
      case 1: return 'Transfer'
      case 2: return 'Transfer Asset'
      case 4: return 'Vote'
      case 6: return 'Create'
      case 9: return 'Participate'
      case 11: return 'Freeze'
      case 12: return 'Unfreeze'
      default: return 'Unregistred Name'
    }
  }
}

export default new ClientWallet()
