import React, { PureComponent, Fragment } from 'react'
import { func } from 'prop-types'

import tl from '../../utils/i18n'
import { isPrivateKeyValid } from '../../services/address'

import Input from '../Input'
import { Text } from '../Utils'
import { Colors } from '../DesignSystem'

import InputOptions from './InputOptions'
import QRScannerModal from './QRScannerModal'

class PrivateKeyInput extends PureComponent {
  static propTypes = {
    innerRef: func,
    onChangeText: func
  }

  static defaultProps = {
    innerRef: () => {},
    onChangeText: () => {}
  }

  state = {
    privateKey: '',
    pkError: null,
    qrModalVisible: false
  }

  _changePrivateKey = pk => {
    const pkError = isPrivateKeyValid(pk.toUpperCase()) ? null : tl.t('importWallet.error.privateKey')
    const privateKey = pk.toUpperCase()

    const { onChangeText } = this.props
    onChangeText(privateKey, pkError)

    this.setState({ privateKey, pkError })
  }

  _openModal = () => this.setState({ qrModalVisible: true })

  _closeModal = () => this.setState({ qrModalVisible: false })

  _onReadScanner = ({ data }) => {
    this._changePrivateKey(data)
    this._closeModal()
  }

  _rightContent = () => (
    <InputOptions
      onPaste={(content) => this._changePrivateKey(content)}
      onPressScanner={this._openModal}
    />
  )

  render () {
    const { innerRef } = this.props
    const { privateKey, pkError, qrModalVisible } = this.state

    return (
      <Fragment>
        <Input
          innerRef={innerRef}
          label={tl.t('privateKey').toUpperCase()}
          rightContent={this._rightContent}
          value={privateKey}
          onChangeText={pk => this._changePrivateKey(pk)}
          multiline
          blurOnSubmit
        />
        {!!pkError && (
          <Text marginY={8} size='xsmall' color={Colors.redError}>
            {pkError}
          </Text>
        )}
        <QRScannerModal
          visible={qrModalVisible}
          onClose={this._closeModal}
          onRead={this._changePrivateKey}
        />
      </Fragment>
    )
  }
}

export default PrivateKeyInput
