import React from 'react'
import { shallow } from 'enzyme'
import { Modal } from 'react-native'

import QRScanner from '../../QRScanner'
import QRScannerModal from '../QRScannerModal'

jest.mock('react-native-qrcode-scanner')
jest.mock('../../../utils/i18n')

describe('QR Scanner Modal component', () => {
  const setup = propOverrides => {
    const props = Object.assign({
      onClose: () => {},
      onRead: () => {}
    }, propOverrides)

    const wrapper = shallow(
      <QRScannerModal {...props} />
    )

    const modalWrapper = wrapper.find(Modal)

    return {
      props,
      wrapper,
      modalWrapper,
      qrScannerWrapper: modalWrapper.find(QRScanner)
    }
  }

  test('Should match when render component', () => {
    const { wrapper } = setup()
    expect(wrapper).toMatchSnapshot()
  })

  test('Should not show modal when visible is false by default', () => {
    const { modalWrapper } = setup()
    expect(modalWrapper.prop('visible')).toBe(false)
  })

  test('Should show modal when visible is true', () => {
    const { modalWrapper } = setup({ visible: true })
    expect(modalWrapper.prop('visible')).toBe(true)
  })

  test('Should onClose triggered when close modal', () => {
    const onClose = jest.fn()
    const { modalWrapper } = setup({ onClose })

    const { onRequestClose } = modalWrapper.props()
    onRequestClose()

    expect(onClose).toBeCalled()
  })

  test('Should onClose triggered when close QRScanner', () => {
    const onClose = jest.fn()
    const { qrScannerWrapper } = setup({ onClose })

    const closeQRScanner = qrScannerWrapper.prop('onClose')
    closeQRScanner()

    expect(onClose).toBeCalled()
  })

  test('Should onRead triggered when QR was scanned', () => {
    const onRead = jest.fn()
    const { qrScannerWrapper } = setup({ onRead })

    const readQRScanner = qrScannerWrapper.prop('onRead')
    readQRScanner()

    expect(onRead).toBeCalled()
  })
})
