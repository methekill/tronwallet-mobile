import { signTransaction, updateTransactions } from '../transactionUtils'
import { logSentry } from '../sentryUtils'
import getTransactionStore from '../../store/transactions'
import transactionList from '../../services/__mocks__/transactionList'

jest.mock('realm')
jest.mock('react-native-tron')
jest.mock('../i18n')
jest.mock('../sentryUtils')
jest.mock('../../services/client')

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
})