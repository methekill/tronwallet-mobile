import { Answers } from 'react-native-fabric'

import getAssetsStore from '../../../store/assets'
import getTransactionStore from '../../../store/transactions'
import getContactsStore from '../../../store/contacts'

import { setupTransactionScene } from './Utils'

jest.mock('react-native-fabric')
jest.mock('react-native-mixpanel')
jest.mock('../../../utils/i18n')

describe('Transaction Scene', () => {
  test('Should add listener when componentDidMount called', () => {
    const addListenerMockResult = jest.fn()
    const addListenerMock = jest.fn(() => (addListenerMockResult))
    const props = { navigation: { addListener: addListenerMock } }

    const { wrapper } = setupTransactionScene(props)
    const instance = wrapper.instance()

    instance.componentDidMount()
    expect(Answers.logContentView).toBeCalledWith('Tab', 'Transactions')
    expect(addListenerMock).toBeCalledWith('didFocus', instance._didFocus)
    expect(instance._didFocusSubscription).toEqual(addListenerMockResult)
  })

  test('Should remove listener when componentWillUnmount called', () => {
    const removeSubscription = jest.fn()

    const { wrapper } = setupTransactionScene()
    const instance = wrapper.instance()
    instance._didFocusSubscription = { remove: removeSubscription }

    instance.componentWillUnmount()

    expect(removeSubscription).toBeCalled()
  })

  test('Should refresh the data when clicking on the refresh Button', () => {
    const { wrapper, syncButton } = setupTransactionScene()
    const spy = jest.spyOn(wrapper.instance(), '_loadData')

    syncButton.props.onPress()
    expect(spy).toBeCalled()
  })

  test('Should load expected transactions when _setData called', async () => {
    const { wrapper } = setupTransactionScene()
    const instance = wrapper.instance()

    const spy = jest.spyOn(instance, '_loadData')

    await instance._setData()

    const state = wrapper.state()

    const transactionStoreRef = await getTransactionStore()
    const contactsStoreRef = await getContactsStore()
    const assetStore = await getAssetsStore()

    expect(state).toMatchObject({ transactionStoreRef, contactsStoreRef, assetStore })
    expect(spy).toBeCalled()
  })
})
