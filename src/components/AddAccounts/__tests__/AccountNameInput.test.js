import React from 'react'
import { shallow } from 'enzyme'

import AccountNameInput from '../AccountNameInput'

jest.mock('../../../utils/i18n')

describe('Account name input component', () => {
  const setup = propOverrides => {
    const props = Object.assign({
      pin: '123456',
      totalAccounts: 1
    }, propOverrides)

    const wrapper = shallow(
      <AccountNameInput {...props} />
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

  test('Should suggest account name when set total account', () => {
    const { wrapper } = setup()
    const { accountName } = wrapper.state()
    expect(accountName).toBe('Account 1')
  })
})
