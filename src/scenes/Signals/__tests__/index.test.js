import React from 'react'
import 'react-native'
import Signals from './../index'
import { shallow } from 'enzyme'
import 'jest-styled-components'

import * as SignalsContent from './../../../services/contentful/notifications'

jest.mock('react-native-fabric')
jest.mock('./../../../services/contentful/notifications')

const list = [{
  title: 'TWX',
  message: 'message',
  updatedAt: '2018-10-25',
  tokenLogo: ''
}]

SignalsContent.getAllSignals = jest.fn().mockResolvedValue(list)

describe('Signals Scene', () => {
  const defaultProps = {
    context: { publicKey: '1234567890' }
  }
  const setup = (propOverrides = {}) => {
    const setupProps = { ...defaultProps, ...propOverrides }

    const wrapper = shallow(
      <Signals {...setupProps} />
    )

    return {
      wrapper
    }
  }

  describe('componentDidMount', () => {
    test('#_fetchData', () => {
      const { wrapper } = setup()
      const instance = wrapper.instance()
      const spyFetchData = jest.spyOn(instance, '_fetchData')
      instance.componentDidMount()
      expect(spyFetchData).toHaveBeenCalled()
    })

    test('should update list after call #_fetchData', async () => {
      const { wrapper } = setup()
      const instance = wrapper.instance()
      const state = wrapper.state()
      expect(state).toMatchObject({ list: [], refreshing: false })
      await instance._fetchData()
      expect(wrapper.state()).toMatchObject({ list, refreshing: false })
    })
  })

  test('Should match snapshot', () => {
    const { wrapper } = setup()
    expect(wrapper).toMatchSnapshot()
  })
})
