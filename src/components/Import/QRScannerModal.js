import React from 'react'
import { Modal } from 'react-native'
import { bool, func } from 'prop-types'

import QRScanner from '../QRScanner'

const QRScannerModal = ({ visible, onClose, onRead }) => (
  <Modal
    visible={visible}
    onRequestClose={onClose}
    animationType='slide'
  >
    <QRScanner
      onRead={onRead}
      onClose={onClose}
      checkAndroid6Permissions
    />
  </Modal>
)

QRScannerModal.propTypes = {
  visible: bool,
  onClose: func.isRequired,
  onRead: func.isRequired
}

QRScannerModal.defaultProps = {
  visible: false
}

export default QRScannerModal
