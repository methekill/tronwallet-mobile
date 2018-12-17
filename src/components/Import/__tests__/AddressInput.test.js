import React from 'react'
import { shallow } from 'enzyme'

import AddressInput from '../AddressInput'

jest.mock('../../../utils/i18n')

describe('Address input component', () => {
  const setup = propOverrides => {
    const props = Object.assign({
    }, propOverrides)

    const wrapper = shallow(
      <AddressInput {...props} />
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
})
