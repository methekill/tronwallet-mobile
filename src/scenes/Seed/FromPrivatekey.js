import React, { Component } from 'react'
import { Alert, Keyboard, ActivityIndicator, Clipboard, Modal } from 'react-native'
import { StackActions, NavigationActions } from 'react-navigation'
import { Answers } from 'react-native-fabric'

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
import { importFromPrivateKey } from '../../utils/secretsUtils'
import { withContext } from '../../store/context'
// import { logSentry } from '../../utils/sentryUtils'
import { isAddressValid } from '../../services/address'

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
    addressError: null,
    pkError: null,
    loading: false
  }

  _changePrivateKey = text => {
    this.setState({
      privateKey: text,
      pkError: null
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
    const { pin, oneSignalId, setImportedPk, loadUserData } = this.props.context
    const { address, privateKey } = this.state
    Keyboard.dismiss()
    try {
      // test address x privatekey
      await importFromPrivateKey(pin, oneSignalId, address, privateKey)
      setImportedPk(true)
      await loadUserData()
      this.props.navigation.dispatch(resetAction)
      Answers.logCustom('Wallet Operation', { type: 'Import from PrivateKey' })
    } catch (error) {
      Alert.alert(tl.t('warning'), 'Address or private key not valid')
    }
  }

  _onPaste = async field => {
    const content = await Clipboard.getString()
    if (content) {
      if (field === 'address') this._changeAddress(content)
      if (field === 'privateKey') this._changePrivateKey(content)
    }
  }

  _openModal = () => this.setState({ qrModalVisible: true })

  _closeModal = () => this.setState({ qrModalVisible: false })

  _readPublicKey = e => this.setState({ address: e.data }, () => {
    this._closeModal()
    this.privateKey.focus()
  })

  _rightContentAddress = () => (
    <React.Fragment>
      <IconButton onPress={() => this._onPaste('address')} icon='md-clipboard' />
      <Utils.HorizontalSpacer />
      <IconButton onPress={this._openModal} icon='ios-qr-scanner' />
    </React.Fragment>
  )

  _rightContentPk = () => (
    <React.Fragment>
      <IconButton onPress={() => this._onPaste('privateKey')} icon='md-clipboard' />
    </React.Fragment>
  )

  render () {
    const { loading, qrModalVisible, address, addressError, privateKey } = this.state
    return (
      <Utils.Container>
        <NavigationHeader
          title='IMPORT FROM PRIVATE KEY'
          onBack={() => this.props.navigation.goBack()}
          noBorder
        />
        <Utils.Content>
          <Input
            innerRef={(input) => { this.address = input }}
            label='ADDRESS'
            rightContent={this._rightContentAddress}
            value={address}
            onChangeText={to => this._changeAddress(to)}
            onSubmitEditing={() => this.privatekey.focus()}
          />
          {addressError && (
            <Utils.Text paddingVertical={10} size='xsmall' color='#ff5454'>
              {addressError}
            </Utils.Text>
          )}
          <Input
            innerRef={(input) => { this.privatekey = input }}
            label='PRIVATE KEY'
            rightContent={this._rightContentPk}
            value={privateKey}
            onChangeText={pk => this._changePrivateKey(pk)}
          />
          <Utils.Text>
          You can use a private key and a address to use our wallet though we
          extremly recomend users to create an account using our Wallet since
          you will not be able to use all the functionalities from this wallet.
          </Utils.Text>
          {loading
            ? <ActivityIndicator size='small' color={Colors.primaryText} />
            : <ButtonGradient
              font='bold'
              text={tl.t('send.title')}
              onPress={this._submit}
            />
          }
        </Utils.Content>
        <Modal
          visible={qrModalVisible}
          onRequestClose={this._closeModal}
          animationType='slide'
        >
          <QRScanner
            onRead={this._readPublicKey}
            onClose={this._closeModal}
            checkAndroid6Permissions
          />
        </Modal>
      </Utils.Container>
    )
  }
}

export default withContext(Restore)
