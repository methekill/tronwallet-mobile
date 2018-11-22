import React from 'react'
import 'react-native'
import PinScene from './../index'
import { BiometricButton } from './../elements'
import { shallow } from 'enzyme'
import 'jest-styled-components'

jest.mock('react-native-fabric')
jest.mock('react-native-mixpanel')
jest.mock('../../../utils/i18n')

jest.mock('react-native-vector-icons/Ionicons', () => jest.fn())

describe('Pin Scene', () => {
  const defaultProps = {
    context: { publicKey: '1234567890' }
  }
  const addListenerMockResult = jest.fn()
  const getParamMockResult = jest.fn()
  const addListenerMock = jest.fn(() => addListenerMockResult)
  const getParamMock = jest.fn(() => getParamMockResult)
  const props = {
    navigation: {
      addListener: addListenerMock,
      getParam: getParamMock,
      state: {
        testInput: jest.fn(),
        onSuccess: jest.fn()
      }
    }
  }

  const setup = (propOverrides = {}) => {
    const setupProps = { ...defaultProps, ...propOverrides }

    const wrapper = shallow(
      <PinScene {...setupProps} />
    )

    return {
      wrapper
    }
  }

  describe('componentDidMount', () => {
    test('#didFocus', () => {
      const { wrapper } = setup(props)
      const instance = wrapper.instance()
      instance.componentDidMount()
      expect(addListenerMock).toBeCalledWith('didFocus', instance._didFocus)
    })
  })

  describe('Biometrics', () => {
    test('Hide the biometrics button when #state.biometricsEnabled is false', () => {
      const { wrapper } = setup(props)
      const state = wrapper.state()
      expect(state).toMatchObject({ biometricsEnabled: false })
      expect(wrapper.find(BiometricButton).exists()).toBeFalsy()
    })

    test('I can see the biometrics button when #state.biometricsEnabled is true', () => {
      const { wrapper } = setup(props)
      const instance = wrapper.instance()
      instance.setState({ biometricsEnabled: true })
      const state = wrapper.state()
      expect(state).toMatchObject({ biometricsEnabled: true })
      expect(wrapper.find(BiometricButton).exists()).toBeTruthy()
    })

    test('Should clicking on the biometrics button when #state.biometricsEnabled is true', () => {
      const { wrapper } = setup(props)
      const instance = wrapper.instance()
      const spy = jest.spyOn(instance, '_handleBiometrics')
      instance.setState({ biometricsEnabled: true })
      const state = wrapper.state()
      const btnBio = wrapper.find(BiometricButton).first()
      expect(state).toMatchObject({ biometricsEnabled: true })
      btnBio.props().onPress()
      expect(spy).toHaveBeenCalled()
      spy.mockRestore()
    })
  })

  test('componentWillUnmount', () => {
    const backHandlerMock = jest.fn()
    const didFocusEvent = jest.fn()
    const { wrapper } = setup(props)
    const instance = wrapper.instance()
    instance.backHandler = { remove: backHandlerMock }
    instance.didFocusEvent = { remove: didFocusEvent }

    instance.componentWillUnmount()
    expect(backHandlerMock).toBeCalled()
    expect(didFocusEvent).toBeCalled()
  })

  test('Should match snapshot', () => {
    const { wrapper } = setup(props)
    expect(wrapper).toMatchSnapshot()
  })
})
