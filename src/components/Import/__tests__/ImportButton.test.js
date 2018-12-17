import React from 'react'
import { shallow } from 'enzyme'
import { ActivityIndicator } from 'react-native'

import ImportButton from '../ImportButton'

jest.mock('../../../utils/i18n')

describe('Import button component', () => {
  const setup = propOverrides => {
    const props = Object.assign({
      onPress: () => {}
    }, propOverrides)

    const wrapper = shallow(
      <ImportButton {...props} />
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

  test('Should not loading when loading props is false by default', () => {
    const { wrapper } = setup()
    expect(wrapper.find(ActivityIndicator).exists()).toBe(false)
  })

  test('Should loading when loading props is true', () => {
    const { wrapper } = setup({ loading: true })
    expect(wrapper.find(ActivityIndicator).exists()).toBe(true)
  })
})
