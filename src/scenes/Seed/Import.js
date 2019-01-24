import React, { Component } from 'react'
import { Alert, Keyboard, ActivityIndicator, Clipboard, Modal } from 'react-native'
import { StackActions, NavigationActions } from 'react-navigation'
import { Answers } from 'react-native-fabric'
import RNTron from 'react-native-tron'
import MixPanel from 'react-native-mixpanel'

// Design
import tl from '../../utils/i18n'
import * as Utils from '../../components/Utils'
import ButtonGradient from '../../components/ButtonGradient'
import NavigationHeader from '../../components/Navigation/Header'
import Input from '../../components/Input'
import { Colors } from '../../components/DesignSystem'
import QRScanner from '../../components/QRScanner'
import IconButton from '../../components/IconButton'

// Utils
import { restoreFromPrivateKey } from '../../utils/secretsUtils'
import { withContext } from '../../store/context'
import { isAddressValid, isPrivateKeyValid } from '../../services/address'
import { logSentry } from '../../utils/sentryUtils'

// Service
import WalletClient from '../../services/client'

const resetAction = StackActions.reset({
  index: 0,
  actions: [NavigationActions.navigate({ routeName: 'App' })],
  key: null
})

class Restore extends Component {
  state = {
    address: '',
    privateKey: '',
    qrModalVisible: false,
    onReadScanner: null,
    addressError: null,
    pkError: null,
    loading: false
  }

  _changePrivateKey = privateKey => {
    const pkError = isPrivateKeyValid(privateKey.toUpperCase()) ? null : tl.t('importWallet.error.privateKey')
    this.setState({
      privateKey: privateKey.toUpperCase(),
      pkError
    })
  }
  _changeAddress = (address) => {
    const addressError = isAddressValid(address) ? null : tl.t('send.error.incompleteAddress')
    this.setState({
      address,
      addressError
    })
  }

  _submit = async () => {
    const { pin, oneSignalId, setSecretMode, loadUserData } = this.props.context
    const { address, privateKey } = this.state
    Keyboard.dismiss()
    this.setState({ loading: true })
    try {
      await this._checkAccount()
      await restoreFromPrivateKey(pin, oneSignalId, address, privateKey)
      setSecretMode('privatekey')
      await loadUserData()
      this.props.navigation.dispatch(resetAction)
      Answers.logCustom('Wallet Operation', { type: 'Import from PrivateKey' })
      MixPanel.track('Import wallet from private key')
    } catch (error) {
      Alert.alert(tl.t('warning'), 'Address or private key not valid')
    } finally {
      this.setState({ loading: false })
    }
  }

  _checkAccount = async () => {
    const { address, privateKey } = this.state
    const mockTransaction = { from: address, to: 'TJo2xFo14Rnx9vvMSm1kRTQhVHPW4KPQ76', amount: 0, token: '1', version: 2.0 }
    try {
      const transactionUnsigned = await WalletClient.getTransferTransaction(mockTransaction)
      const transactionSigned = await RNTron.signTransaction(privateKey, transactionUnsigned)
      await WalletClient.broadcastTransaction(transactionSigned)
    } catch (error) {
      const { response } = error
      // This is a FAIL TO TEST case
      // If it is contract validate error then the combintation PK x ADDRESS is valid
      // Else not a valid combintation
      if (response && response.data) {
        // Working on broadcastTransaction v2 to prevent this kind of code
        if (response.data.type === 'INSUFICIENT_AMOUNT' || response.data.type === 'ACCOUNT_NOT_EXISTS') return
        if (response.data.error !== 'validate signature error') logSentry(error, 'Check Account response')
      }
      throw error
    }
  }

  _onPaste = async field => {
    const content = await Clipboard.getString()
    if (content) {
      if (field === 'address') this._changeAddress(content)
      if (field === 'privateKey') this._changePrivateKey(content)
    }
  }

  _openModal = (onReadScanner) => this.setState({ qrModalVisible: true, onReadScanner })

  _closeModal = () => this.setState({ qrModalVisible: false })

  _readPrivateKey = e => {
    this._changePrivateKey(e.data)
    this._closeModal()
  }

  _readPublicKey = e => {
    this._changeAddress(e.data)
    this._closeModal()
    this.privatekey.focus()
  }

  _rightContentAddress = () => (
    <React.Fragment>
      <IconButton onPress={() => this._onPaste('address')} icon='md-clipboard' />
      <Utils.HorizontalSpacer />
      <IconButton onPress={() => this._openModal(this._readPublicKey)} icon='ios-qr-scanner' />
    </React.Fragment>
  )

  _rightContentPk = () => (
    <React.Fragment>
      <IconButton onPress={() => this._onPaste('privateKey')} icon='md-clipboard' />
      <Utils.HorizontalSpacer />
      <IconButton onPress={() => this._openModal(this._readPrivateKey)} icon='ios-qr-scanner' />
    </React.Fragment>
  )

  _disableImport = () => {
    const { loading, address, addressError, pkError, privateKey } = this.state
    return loading || !address || !privateKey || !!pkError || !!addressError
  }

  render () {
    const {
      loading,
      qrModalVisible,
      onReadScanner,
      address,
      addressError,
      pkError,
      privateKey
    } = this.state
    return (
      <Utils.SafeAreaView>
        <Utils.Container>
          <NavigationHeader
            title={tl.t('importWallet.title')}
            onBack={() => this.props.navigation.goBack()}
            noBorder
          />
          <Utils.Content>
            <Input
              innerRef={(input) => { this.address = input }}
              label={tl.t('address').toUpperCase()}
              rightContent={this._rightContentAddress}
              value={address}
              onChangeText={to => this._changeAddress(to)}
              onSubmitEditing={() => this.privatekey.focus()}
            />
            {addressError && (
              <Utils.Text marginY={8} size='xsmall' color='#ff5454'>
                {addressError}
              </Utils.Text>
            )}
            <Input
              innerRef={(input) => { this.privatekey = input }}
              label={tl.t('privateKey').toUpperCase()}
              rightContent={this._rightContentPk}
              value={privateKey}
              onChangeText={pk => this._changePrivateKey(pk)}
              multiline
              blurOnSubmit
            />
            {pkError && (
              <Utils.Text marginY={8} size='xsmall' color='#ff5454'>
                {pkError}
              </Utils.Text>
            )}
            <Utils.Text marginY={20} size='tiny' font='regular'>
              {tl.t('importWallet.message')}
            </Utils.Text>
            {loading
              ? (<ActivityIndicator size='small' color={Colors.primaryText} />)
              : (
                <ButtonGradient
                  font='bold'
                  text={tl.t('importWallet.button')}
                  onPress={this._submit}
                  disabled={this._disableImport()}
                />
              )
            }
          </Utils.Content>
          <Modal
            visible={qrModalVisible}
            onRequestClose={this._closeModal}
            animationType='slide'
          >
            <QRScanner
              onRead={onReadScanner || this._changeAddress}
              onClose={this._closeModal}
              checkAndroid6Permissions
            />
          </Modal>
        </Utils.Container>
      </Utils.SafeAreaView>
    )
  }
}

export default withContext(Restore)
