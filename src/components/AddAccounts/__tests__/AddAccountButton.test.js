import React from 'react'
import { TouchableOpacity } from 'react-native'
import Feather from 'react-native-vector-icons/Feather'
import { shallow } from 'enzyme'

import AddAccountButton from '../AddAccountButton'
import SyncButton from '../../SyncButton'

jest.mock('../../../utils/i18n')

describe('Account button component', () => {
  const setup = propOverrides => {
    const props = Object.assign({
    }, propOverrides)

    const wrapper = shallow(
      <AddAccountButton {...props} />
    )

    return {
      props,
      wrapper
    }
  }

  test('Should match when render component', () => {
    const { wrapper } = setup()
    expect(wrapper).toMatchSnapshot()
  })

  test('Should show button when secret mode is default value', () => {
    const { wrapper } = setup()

    expect(wrapper.find(TouchableOpacity).exists()).toBe(true)
  })

  test('Should show button when secret mode is mnemonic', () => {
    const { wrapper } = setup({ secretMode: 'mnemonic' })

    expect(wrapper.find(TouchableOpacity).exists()).toBe(true)
  })

  test('Should hide button when secret mode is privatekey', () => {
    const { wrapper } = setup({ secretMode: 'privatekey' })

    expect(wrapper.find(TouchableOpacity).exists()).toBe(false)
  })

  test('Should show plus icon when loading is default value', () => {
    const { wrapper } = setup()

    expect(wrapper.find(Feather).exists()).toBe(true)
  })

  test('Should show plus icon when loading is false', () => {
    const { wrapper } = setup({ loading: false })

    expect(wrapper.find(Feather).exists()).toBe(true)
  })

  test('Should show sync icon when loading is true', () => {
    const { wrapper } = setup({ loading: true })

    expect(wrapper.find(SyncButton).exists()).toBe(true)
  })
})
