import React from 'react'
import 'react-native'
import PinPad from './../PinPad'
import { Key } from './../elements'

import { shallow } from 'enzyme'
import 'jest-styled-components'

jest.mock('react-native-fabric')
jest.mock('react-native-mixpanel')
jest.mock('../../../utils/i18n')
jest.mock('Vibration', () => ({
  vibrate: jest.fn(),
  cancel: jest.fn()
}))

const getRandom = (limit = 10) => Math.floor((Math.random() * limit))

describe('Pin Scene > PinPad', () => {
  const defaultProps = {
    onComplete: jest.fn()
  }
  const setup = (propOverrides = {}) => {
    const setupProps = { ...defaultProps, ...propOverrides }

    const wrapper = shallow(
      <PinPad {...setupProps} />
    )

    return {
      wrapper
    }
  }

  describe('Key button press', () => {
    test('should call _handleKeyInput when the key-button is clicked', () => {
      const { wrapper } = setup()
      const instance = wrapper.instance()
      const spy = jest.spyOn(instance, '_handleKeyInput')
      instance.forceUpdate()
      const btnKey1 = wrapper.find(Key).first()
      btnKey1.props().onPress(1)
      expect(spy).toHaveBeenCalled()
      spy.mockRestore()
    })

    test('should update the pin into state when some key-button is clicked', () => {
      const { wrapper } = setup()
      const randomKey = getRandom(9)
      const btnKey = wrapper.find(Key).at(randomKey)
      const btnValue = parseInt(btnKey.props().children)
      btnKey.props().onPress(btnValue)
      expect(wrapper.state('pin')).toEqual([btnValue])
    })

    test('should delete last value when backspace-button is clicked', () => {
      const { wrapper } = setup()
      wrapper.setState({ pin: [1, 1, 1] })
      const btnBackspace = wrapper.find(Key).at(11)
      const btnKey1 = wrapper.find(Key).first()
      btnKey1.props().onPress(1)
      btnBackspace.props().onPress()
      expect(wrapper.state('pin')).toEqual([1, 1, 1])
    })

    test('should clean value when backspace-button is long pressed', () => {
      const { wrapper } = setup()
      wrapper.setState({ pin: [1, 1, 1, 1, 1, 1] })
      const btnBackspace = wrapper.find(Key).at(11)
      btnBackspace.props().onLongPress()
      expect(wrapper.state('pin')).toEqual([])
    })
  })

  describe('On input complete', () => {
    test('should call #onComplete when state lenght is 6', () => {
      const { wrapper } = setup()
      wrapper.setState({ pin: [1, 1, 1, 1, 1] })
      const instance = wrapper.instance()
      const spy = jest.spyOn(instance, '_handleKeyInput')
      instance.forceUpdate()
      const btnKey1 = wrapper.find(Key).first()
      btnKey1.props().onPress(1)
      expect(wrapper.state('pin').length).toEqual(6)
      expect(spy).toHaveBeenCalled()
      spy.mockRestore()
    })

    test('test submit value when #onComplete is called', () => {
      const onComplete = jest.fn(pin => pin)
      const { wrapper } = setup({ onComplete })
      let inputValue = []
      for (let cont = 0; cont < 6; cont++) {
        const key = getRandom(9)
        const btnKey = wrapper.find(Key).at(key)
        btnKey.props().onPress(
          btnKey.props().children
        )
        inputValue.push(
          btnKey.props().children
        )
      }

      expect(wrapper.state('pin').length).toEqual(6)
      expect(onComplete.mock.results[0].value).toEqual(inputValue.join(''))
    })
  })

  test('Should match snapshot', () => {
    const { wrapper } = setup()
    expect(wrapper).toMatchSnapshot()
  })
})
