import React from 'react'
import { TransactionsSceneWrapper } from '../index'
import { shallow } from 'enzyme'

import SyncButton from '../../../components/SyncButton'
import NavigationHeader from '../../../components/Navigation/Header'

import transactionListMock from '../../../services/__mocks__/transactionList'

jest.mock('react-native-fabric')
jest.mock('../../../utils/i18n')

describe('Transaction Scene', () => {
  const defaultProps = {
    context: { publicKey: '1234567890' }
  }

  const setup = (propOverrides = {}) => {
    const props = { ...defaultProps, ...propOverrides }

    const wrapper = shallow(
      <TransactionsSceneWrapper {...props} />
    )

    return { wrapper }
  }

  test('Should match snapshot', () => {
    const { wrapper } = setup()
    wrapper.setState({ transactions: transactionListMock })
    expect(wrapper).toMatchSnapshot()
  })

  test('Should refresh the data when clicing on the refresh Button', () => {
    TransactionsSceneWrapper._loadData = jest.fn()
    const { wrapper } = setup()
    const spy = jest.spyOn(wrapper.instance(), '_loadData')

    const syncButton = wrapper.find(NavigationHeader).first().props().leftButton
    syncButton.props.onPress()
    expect(spy).toBeCalled()
  })
})