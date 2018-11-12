import { signTransaction, updateTransactions, getTokenPriceFromStore } from '../transactionUtils'
import { logSentry } from '../sentryUtils'
import getTransactionStore from '../../store/transactions'
import transactionList from '../../services/__mocks__/transactionList'
import getAssetsStore from '../../store/assets'

jest.mock('realm')
jest.mock('react-native-tron')
jest.mock('../i18n')
jest.mock('../sentryUtils')
jest.mock('../../services/client')
jest.mock('../deeplinkUtils', () => {
  TronVaultURL: 'testurl'
})

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
      expect(logSentry).toBeCalledWith('signTransaction error', 'Signing Transaction')
    })
  })

  describe('#updateTransactions', () => {
    test('update realm transactions', async () => {
      await updateTransactions('any address')
      transactionStoreRef = await getTransactionStore()
      expect(transactionStoreRef.objects('Transaction').length).toBe(transactionList.length)
    })
  })

  describe('#getTokenPriceFromStore', () => {
    let assetStore
    beforeEach(async () => {
      assetStore = await getAssetsStore()
      assetStore.write(() => {
        assetStore.create('Asset', { id: 1, name: 'TWX', price: 1000 })
        assetStore.create('Asset', { id: 2, name: 'ANOTHER_TOKEN', price: 100 })
      })

      // Mock the realm filtered method 
      assetStore.filtered = (store, query) => (
        assetStore.objects(store).filter(a => `name == '${a.name}'` === query)
      )
    })

    test('Should return the TWX price', async () => {
      const price = await getTokenPriceFromStore('TWX', assetStore)
      expect(price).toBe(1000)
    })

    test('Should return ANOTHER_TOKEN price', async () => {
      const price = await getTokenPriceFromStore('ANOTHER_TOKEN', assetStore)
      expect(price).toBe(100)
    })
  })
})