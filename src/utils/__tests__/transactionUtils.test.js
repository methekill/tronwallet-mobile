import { signTransaction, updateTransactions, getTokenPriceFromStore } from '../transactionUtils'
import * as sentryUtils from '../sentryUtils'
import getTransactionStore from '../../store/transactions'
import transactionList from '../../services/__mocks__/transactionList'
import getAssetsStore from '../../store/assets'
import axios from 'axios'

jest.mock('axios')
jest.mock('realm')
jest.mock('react-native-tron')
jest.mock('../i18n')
jest.mock('../sentryUtils')
sentryUtils.logSentry = jest.fn()

jest.mock('../../services/client')
jest.mock('../deeplinkUtils', () => ({
  TronVaultURL: 'testurl'
}))

describe('Transaction Utils', () => {
  describe('#signTransaction', async () => {
    test('should return the signed transaction when valid key and transaction', async () => {
      const privateKey = 'valid key'
      const transactionUnsigned = 'transaction'

      const transactionSigned = await signTransaction(privateKey, transactionUnsigned)
      expect(transactionSigned).toBe('signTransaction success')
    })

    test('should send the error to sentry when something goes wrong', async () => {
      const privateKey = 'invalid pass'
      const transactionUnsigned = 'transaction'

      await signTransaction(privateKey, transactionUnsigned)
      expect(sentryUtils.logSentry).toBeCalledWith('signTransaction error', 'Signing Transaction')
    })
  })

  describe('#updateTransactions', () => {
    test('update realm transactions', async () => {
      const resp = { data: transactionList }
      axios.post = jest.fn(() => Promise.resolve(resp))
      await updateTransactions('12345678945454544')
      const transactionStoreRef = await getTransactionStore()
      expect(transactionStoreRef.objects('Transaction').length).toBe(transactionList.length)
    })
  })

  describe('#getTokenPriceFromStore', () => {
    let assetStore
    beforeEach(async () => {
      assetStore = await getAssetsStore()
      assetStore.write(() => {
        assetStore.create('Asset', { id: '1', name: 'TWX', price: 1000 })
        assetStore.create('Asset', { id: '2', name: 'ANOTHER_TOKEN', price: 100 })
      })

      // Mock the realm filtered method
      assetStore.filtered = (store, query) => (
        // assetStore.objects(store).filter(a => `name == '${a.name}'` === query)
        assetStore.objects(store).filter(a => (`id ='${a.id}'` === query))
      )
    })

    test('Should return the TWX price', async () => {
      const price = await getTokenPriceFromStore('1', assetStore)
      console.log('...', price)
      expect(price).toBe(1000)
    })

    test('Should return ANOTHER_TOKEN price', async () => {
      const price = await getTokenPriceFromStore('2', assetStore)
      expect(price).toBe(100)
    })
  })
})
