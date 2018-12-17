import React from 'react'
import { shallow } from 'enzyme'

import PrivateKeyInput from '../PrivateKeyInput'

jest.mock('../../../utils/i18n')

describe('Private key input component', () => {
  const setup = propOverrides => {
    const props = Object.assign({
    }, propOverrides)

    const wrapper = shallow(
      <PrivateKeyInput {...props} />
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
