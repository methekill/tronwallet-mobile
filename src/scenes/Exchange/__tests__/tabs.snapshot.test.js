import React from 'react'
import { shallow } from 'enzyme'
import { ExchangeTabs } from '../Tabs/index'
import exchangeListMock from '../../../services/__mocks__/exchangeList.json'

jest.mock('./../../../utils/i18n')

describe('Exchange Transactions (Sell/Buy) Snapshot', () => {
  let exchangeSceneWrapper = null
  let navigation = null
  let exchangeData
  beforeEach(() => {
    exchangeData = exchangeListMock.find(ex => ex.exchangeId === 15)
    navigation = { addListener: jest.fn(), getParam: jest.fn(() => exchangeData) }
    const props = { navigation }

    exchangeSceneWrapper = shallow(<ExchangeTabs {...props} />)
  })

  test('Should match snapshot', () => {
    expect(exchangeSceneWrapper).toMatchSnapshot()
  })
})
