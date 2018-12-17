import React, { PureComponent, Fragment } from 'react'
import { func } from 'prop-types'

import tl from '../../utils/i18n'
import { isAddressValid } from '../../services/address'

import Input from '../Input'
import { Text } from '../Utils'
import { Colors } from '../DesignSystem'

import InputOptions from './InputOptions'
import QRScannerModal from './QRScannerModal'

class AddressInput extends PureComponent {
  static propTypes = {
    onChangeText: func,
    innerRef: func,
    onSubmitEditing: func
  }

  static defaultProps = {
    onChangeText: () => {},
    innerRef: () => {},
    onSubmitEditing: () => {}
  }

  state = {
    address: '',
    addressError: null,
    qrModalVisible: false
  }

  _changeAddress = (address) => {
    const addressError = isAddressValid(address) ? null : tl.t('send.error.incompleteAddress')

    const { onChangeText } = this.props
    onChangeText(address, addressError)

    this.setState({ address, addressError })
  }

  _openModal = () => this.setState({ qrModalVisible: true })

  _closeModal = () => this.setState({ qrModalVisible: false })

  _onReadScanner = ({ data }) => {
    this._changeAddress(data)
    this._closeModal()
  }

  _rightContent = () => (
    <InputOptions
      onPaste={(content) => this._changeAddress(content)}
      onPressScanner={this._openModal}
    />
  )

  render () {
    const { innerRef, onSubmitEditing } = this.props
    const { address, addressError, qrModalVisible } = this.state

    return (
      <Fragment>
        <Input
          innerRef={innerRef}
          label={tl.t('address').toUpperCase()}
          rightContent={this._rightContent}
          value={address}
          onChangeText={to => this._changeAddress(to)}
          onSubmitEditing={onSubmitEditing}
        />
        {!!addressError && (
          <Text marginY={8} size='xsmall' color={Colors.redError}>
            {addressError}
          </Text>
        )}
        <QRScannerModal
          visible={qrModalVisible}
          onClose={this._closeModal}
          onRead={this._changeAddress}
        />
      </Fragment>
    )
  }
}

export default AddressInput
