import React from 'react'
import 'react-native'
import { shallow } from 'enzyme'
import Card from './../Card'
import { BtnTrash } from './../elements'

jest.mock('./../../../../utils/__mocks__/i18n')

describe('Balance <Card>', () => {
  const defaultProps = {
    context: {
      publicKey: '1234567890',
      price: {
        TRX: 1000
      },
      currency: 'TRX'
    },
    price: 1000,
    bandwidth: 50,
    currency: 'TRX',
    onCopy: jest.fn(),
    onDelete: jest.fn(),
    onCurrencyPress: jest.fn()
  }
  const setup = (propOverrides = {}) => {
    const props = { ...defaultProps, ...propOverrides }

    return shallow(
      <Card {...props} />
    )
  }

  let wrapper = null
  beforeEach(() => {
    wrapper = setup()
  })

  test('renders without crashing', () => {
    expect(wrapper).toBeDefined()
  })

  test('renders one button when showDeleteBtn is true', () => {
    wrapper.setProps({ showDeleteBtn: true })
    const btn = wrapper.find(BtnTrash)
    expect(btn).toHaveLength(1)
  })

  test('hide trash button when showDeleteBtn is false', () => {
    wrapper.setProps({ showDeleteBtn: false })
    expect(wrapper.find(BtnTrash)).toHaveLength(0)
  })
})
