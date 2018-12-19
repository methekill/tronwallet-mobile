import React from 'react'
import { shallow } from 'enzyme'

import AddAccountModal from '../AddAccountModal'

jest.mock('../../../utils/i18n')

describe('Add account Modal component', () => {
  const setup = propOverrides => {
    const props = Object.assign({
      pin: '123456',
      totalAccounts: 1
    }, propOverrides)

    const wrapper = shallow(
      <AddAccountModal {...props} />
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
