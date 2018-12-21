import React from 'react'
import { shallow } from 'enzyme'
import { ExchangeScene } from './../index'
import exchangeListMock from '../../../services/__mocks__/exchangeList.json'
import * as Contentful from '../../../services/contentful/general'
import WalletClient from '../../../services/client'

jest.mock('./../../../utils/i18n')
jest.mock('./../../../utils/sentryUtils')
jest.mock('./../../../store/context')

Contentful.getExchangeContentful = jest.fn(() => [])
WalletClient.getExchangesList = jest.fn().mockResolvedValue(exchangeListMock.slice(0, 2))

describe('Exchange - List', () => {
  let wrapper = null
  let navigation = null
  let defaultProps = {
    context: { publickey: '1234567890', balances: [] }
  }

  const addListenerMockResult = jest.fn()
  const addListenerMock = jest.fn(() => addListenerMockResult)
  const removeSubscription = jest.fn()
  const navigate = jest.fn(params => params)

  beforeEach(() => {
    navigation = { addListener: addListenerMock, remove: removeSubscription, navigate }

    const props = { navigation }

    wrapper = shallow(<ExchangeScene {...defaultProps} {...props} />)
  })

  test('should add didFocus subscription', () => {
    // Arrange
    const instance = wrapper.instance()

    // Act
    instance.componentDidMount()

    // Assert
    expect(instance._didFocusSubscription).toEqual(addListenerMockResult)
  })

  test('should remove didFocus subscription', () => {
    const instance = wrapper.instance()
    instance.componentDidMount()
    instance._didFocusSubscription = { remove: removeSubscription }

    instance.componentWillUnmount()

    expect(removeSubscription).toBeCalled()
  })

  test('#_loadData', async () => {
    // Assert
    const instance = wrapper.instance()
    const spyLoadData = jest.spyOn(instance, '_loadData')

    // Act
    instance.componentDidMount()

    // Assert
    expect(spyLoadData).toHaveBeenCalled()
  })

  test('Load data to state', async () => {
    // Arrange
    const instance = wrapper.instance()
    const state = wrapper.state()
    instance._sortExList = jest.fn((list, _) => list.map(value => ({
      ...value,
      firstTokenAbbr: '',
      secondTokenAbbr: '',
      isEnabled: true,
      firstTokenImage: '',
      secondTokenImage: ''
    })))

    // Act
    expect(state).toMatchObject({
      exchangeList: [],
      loading: true,
      refreshing: false,
      isSearching: false,
      searchName: '',
      currentList: [],
      favoriteExchanges: []})

    await instance._loadData()

    // Assert
    expect(wrapper.state()).toMatchObject({
      exchangeList: exchangeListMock.slice(0, 2),
      loading: false,
      refreshing: false,
      isSearching: false,
      searchName: '',
      currentList: exchangeListMock.slice(0, 2),
      favoriteExchanges: []})
  })

  test('Single Item from Exchange List should match the list item data', async () => {
    // Arrange
    const instance = wrapper.instance()
    const item = exchangeListMock.find(ex => ex.exchangeId === 15)

    // Act
    const element = instance._renderItem({ item })

    // Assert
    const {
      exchangeId,
      creatorAddress,
      firstTokenBalance,
      firstTokenId,
      secondTokenId,
      secondTokenBalance,
      price,
      variation,
      createTime
    } = element.props.exchangeData

    expect({
      exchangeId,
      creatorAddress,
      firstTokenBalance,
      firstTokenId,
      secondTokenId,
      secondTokenBalance,
      price,
      createTime,
      variation
    }).toEqual(item)
  })

  test('Should navigate with param to Sell/Buy when item clicked', () => {
    // Arrange
    const instance = wrapper.instance()
    const item = exchangeListMock.find(ex => ex.exchangeId === 15)

    // Act
    const spy = jest.spyOn(instance, '_onItemPressed')
    const element = instance._renderItem({ item })
    element.props.onItemPress(item)

    // Assert
    expect(spy).toBeCalledWith(item)
  })
})
