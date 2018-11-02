import React from 'react'
import { TransactionsSceneWrapper } from '../index'
import { shallow } from 'enzyme'

import transactionListMock from '../../../services/__mocks__/transactionList'

jest.mock('react-native-fabric')
jest.mock('../../../utils/i18n')

describe('Transaction Scene', () => {
  const defaultProps = {}

  const setup = (propOverrides = {}) => {
    const props = { ...defaultProps, ...propOverrides }

    const wrapper = shallow(
      <TransactionsSceneWrapper {...props} />
    )

    return { wrapper }
  }

  test('Should match snapshot', () => {
    const props = { context: { publicKey: '1234567890' }}
    const { wrapper } = setup(props)
    wrapper.setState({ transactions: transactionListMock })

    console.log(wrapper.debug())
    expect(wrapper).toMatchSnapshot()
  })
})