import React from 'react'
import { shallow } from 'enzyme'
import { ExchangeScene } from './../index'
import exchangeListMock from './../../../services/__mocks__/exchangeList.json'

jest.mock('./../../../utils/i18n')
jest.mock('./../../../utils/sentryUtils')
jest.mock('./../../../store/context')

describe('Exchange List Snapshot', () => {
  let exchangeSceneWrapper = null
  beforeEach(() => {
    const props = { }

    exchangeSceneWrapper = shallow(<ExchangeScene {...props} />)
  })

  test('Should match snapshot', () => {
    exchangeSceneWrapper.setState({ transactions: exchangeListMock })
    expect(exchangeSceneWrapper).toMatchSnapshot()
  })
})
