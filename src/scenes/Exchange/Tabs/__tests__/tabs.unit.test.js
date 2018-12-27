import React from 'react'
import { shallow } from 'enzyme'
import { ExchangeTabs } from '../index'
import exchangeListMock from '../../../../services/__mocks__/exchangeList.json'
import exchangeTransactionMock from '../../../../services/__mocks__/exchangeTransactions.json'
import Async from '../../../../utils/asyncStorageUtils'
import WalletClient from '../../../../services/client'

jest.mock('../../../../utils/i18n')
jest.mock('../../../../utils/sentryUtils')
jest.mock('socket.io-client')

describe('Exchange - Sell/Buy Tabs', () => {
  let wrapper = null
  let navigation = null
  let exchangeData
  beforeEach(() => {
    exchangeData = exchangeListMock.find(ex => ex.exchangeId === 15)
    navigation = { addListener: jest.fn(), getParam: jest.fn(() => exchangeData) }
    const props = { navigation }

    wrapper = shallow(<ExchangeTabs {...props} />)
  })

  test('Ask for Pin should be activated', async () => {
    // Assert
    const instance = wrapper.instance()
    Async.get = jest.fn().mockResolvedValue('true')

    // Act
    await instance._loadAskPin()

    // Assert
    const state = wrapper.state()
    expect(state.askPinEx).toBe(true)
  })

  test('Should load the latest exchange transactions', async () => {
    // Assert
    const instance = wrapper.instance()
    WalletClient.getTransactionExchangesList = jest.fn(() => exchangeTransactionMock)
    // Act
    await instance._loadExchangesTransactions()

    // Assert
    const state = wrapper.state()
    expect(state.lastTransactions).toBe(exchangeTransactionMock)
    expect(state.refreshingExchange).toBe(false)
  })
})
