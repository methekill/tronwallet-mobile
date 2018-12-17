import React from 'react'
import { shallow } from 'enzyme'

import IconButton from '../../IconButton'
import InputOptions from '../InputOptions'

describe('Input options component', () => {
  const setup = propOverrides => {
    const props = Object.assign({
      onPressScanner: () => {},
      onPaste: () => {}
    }, propOverrides)

    const wrapper = shallow(
      <InputOptions {...props} />
    )

    const iconWrapper = wrapper.find(IconButton)

    return {
      props,
      wrapper,
      clipboardWrapper: iconWrapper.first(),
      qrScannerWrapper: iconWrapper.last()
    }
  }

  test('Should match when render component', () => {
    const { wrapper } = setup()
    expect(wrapper).toMatchSnapshot()
  })

  // Check way to work with Clipboard.getString
  // test('Should onPaste triggered when press clipboard icon', async () => {
  //   const onPaste = jest.fn()
  //   const { wrapper } = setup({ onPaste })

  //   const instance = wrapper.instance()
  //   await instance._onPaste()

  //   expect(onPaste).toBeCalled()
  // })

  test('Should onPressScanner triggered when press scanner icon', () => {
    const onPressScanner = jest.fn()
    const { qrScannerWrapper } = setup({ onPressScanner })

    qrScannerWrapper.simulate('press')

    expect(onPressScanner).toBeCalled()
  })
})
