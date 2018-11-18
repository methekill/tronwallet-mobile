import React from 'react'
import { TransactionsScene } from './../index'
import { shallow } from 'enzyme'
import { Answers } from 'react-native-fabric'

import NavigationHeader from '../../../components/Navigation/Header'

import getAssetsStore from '../../../store/assets'
import getTransactionStore from '../../../store/transactions'
import getContactsStore from '../../../store/contacts'

import transactionListMock from '../../../services/__mocks__/transactionList'

jest.mock('react-native-fabric')
jest.mock('react-native-mixpanel')
jest.mock('../../../utils/i18n')

describe('Transaction Scene', () => {
  const defaultProps = {
    context: { publicKey: '1234567890' }
  }

  const setup = (propOverrides = {}) => {
    const props = { ...defaultProps, ...propOverrides }

    const wrapper = shallow(
      <TransactionsScene {...props} />
    )

    return {
      wrapper,
      syncButton: wrapper.find(NavigationHeader).first().props().leftButton
    }
  }

  test('componentDidMount', () => {
    const addListenerMockResult = jest.fn()
    const addListenerMock = jest.fn(() => (addListenerMockResult))
    const props = { navigation: { addListener: addListenerMock } }

    const { wrapper } = setup(props)
    const instance = wrapper.instance()

    const spy = jest.spyOn(instance, '_setData')

    instance.componentDidMount()
    expect(Answers.logContentView).toBeCalledWith('Tab', 'Transactions')
    expect(addListenerMock).toBeCalledWith('didFocus', instance._didFocus)
    expect(instance._didFocusSubscription).toEqual(addListenerMockResult)
    expect(spy).toBeCalled()
  })

  test('componentWillUnmount', () => {
    const removeSubscription = jest.fn()

    const { wrapper } = setup()
    const instance = wrapper.instance()
    instance._didFocusSubscription = { remove: removeSubscription }

    instance.componentWillUnmount()
    expect(removeSubscription).toBeCalled()
  })

  test('Should match snapshot', () => {
    const { wrapper } = setup()
    wrapper.setState({ transactions: transactionListMock })
    expect(wrapper).toMatchSnapshot()
  })

  test('Should refresh the data when clicing on the refresh Button', () => {
    const { wrapper, syncButton } = setup()
    const spy = jest.spyOn(wrapper.instance(), '_loadData')

    syncButton.props.onPress()
    expect(spy).toBeCalled()
  })

  describe('#_setData', () => {
    test('_setData', async () => {
      const { wrapper } = setup()
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
})
