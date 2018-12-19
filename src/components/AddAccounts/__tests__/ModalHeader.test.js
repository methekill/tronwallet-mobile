import React from 'react'
import { shallow } from 'enzyme'

import ModalHeader from '../ModalHeader'

jest.mock('../../../utils/i18n')

describe('Modal header component', () => {
  const setup = propOverrides => {
    const props = Object.assign({
      title: 'Unit test'
    }, propOverrides)

    const wrapper = shallow(
      <ModalHeader {...props} />
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
