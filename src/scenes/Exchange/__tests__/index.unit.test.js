import React from 'react'
import { shallow } from 'enzyme'
import { ExchangeScene } from './../index'
import exchangeListMock from '../../../services/__mocks__/exchangeList.json'

jest.mock('./../../../utils/i18n')
jest.mock('./../../../utils/sentryUtils')
jest.mock('./../../../store/context')

describe('Exchange - List', () => {
  let wrapper = null
  let navigation = null

  const addListenerMockResult = jest.fn()
  const addListenerMock = jest.fn(() => addListenerMockResult)
  const removeSubscription = jest.fn()
  const navigate = jest.fn(params => params)

  beforeEach(() => {
    navigation = { addListener: addListenerMock, remove: removeSubscription, navigate }

    const props = { navigation }

    wrapper = shallow(<ExchangeScene {...props} />)
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

  test('Exchange data should match the list item data', async () => {
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
    // TODO-Refactor this test
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
