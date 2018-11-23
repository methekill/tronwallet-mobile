import { Answers } from 'react-native-fabric'

import getContactsStore from '../../../store/contacts'
import getTransactionStore, { createNewTransactionStore } from '../../../store/transactions'

import { setupTransactionScene } from './Utils'
import transactionList from '../../../services/__mocks__/transactionList'

jest.mock('react-native-fabric')
jest.mock('react-native-mixpanel')
jest.mock('../../../utils/i18n')
jest.mock('../../../utils/sentryUtils')
jest.mock('../../../services/client')

describe('Transaction Scene', () => {
  let transactionScene = null
  let addListenerMockResult = null
  let contactsStore = null
  let transactionStore = null

  beforeAll(async () => {
    addListenerMockResult = jest.fn()

    transactionStore = await getTransactionStore()
    contactsStore = await getContactsStore()

    contactsStore.write(() => {
      contactsStore.create('Contact', { id: '1', address: 'asdf1234', alias: 'Contact1' })
      contactsStore.create('Contact', { id: '2', address: 'fdsa4321', alias: 'Contact2' })
    })
  })

  beforeEach(async () => {
    const addListenerMock = jest.fn(() => (addListenerMockResult))
    const props = { navigation: { addListener: addListenerMock, getParam: () => null } }

    transactionScene = setupTransactionScene(props)

    const state = transactionScene.wrapper.state()

    state.contactsStoreRef = contactsStore
    state.transactionStoreRef = transactionStore
  })

  test('Should add listener when component did mount', () => {
    const { wrapper } = transactionScene
    const instance = wrapper.instance()

    instance.componentDidMount()

    expect(Answers.logContentView).toBeCalledWith('Tab', 'Transactions')
    expect(instance._didFocusSubscription).toEqual(addListenerMockResult)
  })

  test('Should remove listener when component will unmount', () => {
    const removeSubscription = jest.fn()

    const { wrapper } = transactionScene
    const instance = wrapper.instance()
    instance._didFocusSubscription = { remove: removeSubscription }

    instance.componentWillUnmount()

    expect(removeSubscription).toBeCalled()
  })

  test('Should refresh the data when clicking on the refresh Button', () => {
    const { wrapper, syncButton } = transactionScene
    const spy = jest.spyOn(wrapper.instance(), '_loadData')

    syncButton.props.onPress()
    expect(spy).toBeCalled()
  })

  test('Should load alias when contacts have publicKey', async () => {
    const { wrapper } = transactionScene
    const instance = wrapper.instance()
    const { context } = instance.props

    context.publicKey = 'asdf1234'

    await instance._loadData()

    const { currentAlias } = wrapper.state()

    expect(currentAlias).toBe('Contact1')
  })

  test('Should load publicKey when contacts doesn\'t have publicKey', async () => {
    const { wrapper } = transactionScene
    const instance = wrapper.instance()
    const { context } = instance.props

    context.publicKey = 'anotherPK'

    await instance._loadData()

    const { currentAlias } = wrapper.state()

    expect(currentAlias).toBe('anotherPK')
  })

  test('Should load only 10 first transactions when there isn\'t contact and refreshing is false and all transactions is 20', async () => {
    const { wrapper } = transactionScene
    const instance = wrapper.instance()
    instance.props.navigation.getParam = () => {}

    const transactionStore = await createNewTransactionStore()
    transactionStore.write(() => {
      transactionList.forEach((trx, index) => {
        transactionStore.create('Transaction', Object.assign({ id: index }, trx))
      })
    })

    wrapper.state().transactionStoreRef = transactionStore

    let transactions = null
    instance._updateData = (transactionsRef) => {
      transactions = transactionsRef.map(item => Object.assign({}, item))
    }

    await instance._loadData(false)

    expect(transactions.length).toBe(10)
  })

  test('Should load transactions less than 10 when there isn\'t contact and refreshing is false and all transactions is 8', async () => {
    const { wrapper } = transactionScene
    const instance = wrapper.instance()

    instance.props.navigation.getParam = () => {}

    let transactions = null
    instance._updateData = (transactionsRef) => {
      transactions = transactionsRef.map(item => Object.assign({}, item))
    }

    await instance._loadData(false)

    expect(transactions.length).toBeLessThan(10)
  })
})
