
import transactionList from './transactionList'

const getTransactionsList = (address) => {
  return transactionList
}

const ClientWallet = jest.fn().mockImplementation(() => {
  return {
    getTransactionsList
  }
})

export default new ClientWallet()
