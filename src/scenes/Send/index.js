import React, { Component } from 'react'
import {
  ActivityIndicator,
  Clipboard,
  Alert,
  Modal,
  TouchableOpacity,
  Keyboard,
  ScrollView,
  AsyncStorage
} from 'react-native'
import { Answers } from 'react-native-fabric'
import Ionicons from 'react-native-vector-icons/Ionicons'
import ActionSheet from 'react-native-actionsheet'
import MixPanel from 'react-native-mixpanel'

import tl from '../../utils/i18n'
import ButtonGradient from '../../components/ButtonGradient'
import Client from '../../services/client'
import Input from '../../components/Input'
import QRScanner from '../../components/QRScanner'
import IconButton from '../../components/IconButton'
import * as Utils from '../../components/Utils'
import { Colors } from '../../components/DesignSystem'
import KeyboardScreen from '../../components/KeyboardScreen'
import NavigationHeader from '../../components/Navigation/Header'

import { isAddressValid } from '../../services/address'
import { signTransaction } from '../../utils/transactionUtils'
import { formatNumber, MINIMUM } from '../../utils/numberUtils'
import getBalanceStore from '../../store/balance'
import { withContext } from '../../store/context'
import { USER_FILTERED_TOKENS } from '../../utils/constants'
import { logSentry } from '../../utils/sentryUtils'
import InputTextButton from '../../components/InputTextButton'
import { replaceRoute } from '../../utils/navigationUtils'
import { orderBalancesV2 } from '../../utils/balanceUtils'
import onBackgroundHandler from '../../utils/onBackgroundHandler'

class SendScene extends Component {
  static navigationOptions = () => {
    return { header: null }
  }

  state = {
    from: '',
    to: this.props.navigation.getParam('address', ''),
    amount: '',
    tokenId: '1',
    description: '',
    addressError: null,
    formattedToken: '',
    balances: [{ balance: 0, token: 'TRX', id: '1' }],
    error: null,
    warning: null,
    loadingSign: false,
    loadingData: true,
    trxBalance: 0.0,
    QRModalVisible: false
  }

  componentDidMount () {
    Answers.logContentView('Page', 'Send')
    this._navListener = this.props.navigation.addListener('didFocus', this._loadData)
    this.appStateListener = onBackgroundHandler(this._onAppStateChange)
  }

  componentDidUpdate () {
    const { to } = this.state
    const address = this.props.navigation.getParam('address', null)

    if (address && address !== to) {
      this._changeAddress(address)
    }
  }

  componentWillUnmount () {
    this._navListener.remove()
    this.appStateListener.remove()
  }

  _getBalancesFromStore = async () => {
    const store = await getBalanceStore()
    // console.log('filter', `account = "${this.props.context.publicKey}"`)
    return store
      .objects('Balance')
      .filtered(`account = "${this.props.context.publicKey}"`)
      .map(item => Object.assign({}, item))
  }

  _onAppStateChange = nextAppState => {
    if (nextAppState.match(/background/)) {
      this.setState({ QRModalVisible: false })
      if (this.ActionSheet && this.ActionSheet.hide) this.ActionSheet.hide()
    }
  }

  _loadData = async () => {
    this.clearInput()
    this.setState({ loading: true })
    const { getCurrentBalances, publicKey, fixedTokens } = this.props.context
    let orderedBalances = []
    let balance = 0
    let tokenId = 0
    let currentBalances = getCurrentBalances()

    if (currentBalances.length) {
      const assetBalance = currentBalances.find(asset => asset.id === '1')
      balance = assetBalance.balance
      tokenId = assetBalance.id

      const userTokens = await AsyncStorage.getItem(USER_FILTERED_TOKENS)
      const filteredBalances = currentBalances.filter(asset => JSON.parse(userTokens).findIndex(id => id === asset.id) === -1)
      orderedBalances = orderBalancesV2(filteredBalances, fixedTokens)
    }

    this.setState({
      from: publicKey,
      balances: orderedBalances,
      loadingData: false,
      trxBalance: balance,
      formattedToken: this._formatBalance('TRX', balance, tokenId),
      warning: balance === 0 ? tl.t('send.error.insufficientBalance') : null
    })
  }

  _changeInput = (text, field) => {
    this.setState({
      [field]: text,
      error: null
    })
  }

  _changeAddress = to => {
    const trimmedTo = to.trim()
    if (!trimmedTo.length || isAddressValid(trimmedTo)) {
      this.setState({
        to: trimmedTo,
        addressError: null
      })
    } else {
      this.setState({
        to: trimmedTo,
        addressError: tl.t('send.error.incompleteAddress')
      })
    }
  }

  _submit = () => {
    const { amount, to, balances, tokenId, from, description } = this.state
    if (!isAddressValid(to) || from === to) {
      this.setState({ error: tl.t('send.error.invalidReceiver') })
      return
    }

    const balanceSelected = balances.find(b => b.id === tokenId)
    if (!balanceSelected) {
      this.setState({ error: tl.t('send.error.selectBalance') })
      return
    }

    if (description.length > 500) {
      this.setState({ error: 'Description too long' })
      return
    }

    if (!amount || balanceSelected.balance < amount || amount <= 0) {
      this.setState({ error: tl.t('send.error.invalidAmount') })
      return
    }

    this._transferAsset()
  }

  clearInput = () => {
    this.setState({
      to: '',
      tokenId: '1',
      amount: '',
      description: ''
    })
  }

  _transferAsset = async () => {
    const { from, to, amount, tokenId, description } = this.state
    this.setState({ loadingSign: true, error: null })

    try {
      const payload = {
        from,
        to,
        token: tokenId,
        amount: Number(amount).toFixed(6),
        data: description
      }

      // Serverless
      const data = await Client.getTransferTransaction(payload)
      this._openTransactionDetails(data)
      this.clearInput()
      MixPanel.trackWithProperties('Send Transaction', payload)
    } catch (error) {
      Alert.alert(tl.t('warning'), tl.t('error.default'))
      this.setState({
        loadingSign: false
      })
      logSentry(error, 'Send - Create Tx')
    }
  }

  _openTransactionDetails = async transactionUnsigned => {
    try {
      const { accounts, publicKey } = this.props.context
      const privateKey = accounts.find(item => item.address === publicKey).privateKey
      const transactionSigned = await signTransaction(privateKey, transactionUnsigned)
      this.setState({ loadingSign: false, error: null }, () => {
        replaceRoute(this.props.navigation, 'SubmitTransaction', {
          tx: transactionSigned
        })
      })
      MixPanel.trackWithProperties('Navigate to transaction details', { type: 'Open Tx' })
    } catch (error) {
      Alert.alert(tl.t('warning'), tl.t('error.default'))
      this.setState({ loadingSign: false })
      logSentry(error, 'Send - Open Tx')
    }
  }

  _setMaxAmount = () => {
    const { balances, tokenId } = this.state
    const balanceSelected = balances.find(b => b.id === tokenId) || balances[0]
    const value =
      balanceSelected.balance < MINIMUM && balanceSelected.balance > 0
        ? balanceSelected.balance.toFixed(7)
        : balanceSelected.balance
    this.setState({ amount: value })
  }

  _readPublicKey = e =>
    this.setState({ to: e.data }, () => {
      this._closeModal()
      this._nextInput('to')
    })

  _openModal = () => this.setState({ QRModalVisible: true })

  _onPaste = async () => {
    const content = await Clipboard.getString()
    if (content) {
      this._changeAddress(content)
      this._nextInput('to')
    }
  }

  _closeModal = () => {
    if (this.state.QRModalVisible) {
      this.setState({ QRModalVisible: false })
    }
  }

  _formatBalance = (token, balance, tokenId) => `[${tokenId}] ${token} - ${formatNumber(balance)}`

  _rightContentTo = () => (
    <React.Fragment>
      <IconButton onPress={this._onPaste} icon='md-clipboard' />
      <Utils.HorizontalSpacer />
      <IconButton onPress={this._openModal} icon='ios-qr-scanner' />
    </React.Fragment>
  )

  _rightContentToken = () => (
    <Utils.View paddingX='small'>
      <Ionicons name='ios-arrow-down' color={Colors.primaryText} size={24} />
    </Utils.View>
  )

  _rightContentAmount = () => (
    <InputTextButton onPress={this._setMaxAmount} text='MAX' />
  )

  _nextInput = currentInput => {
    if (currentInput === 'token') {
      this.to.focus()
      return
    }

    if (currentInput === 'to') {
      this.amount.focus()
      return
    }

    if (currentInput === 'amount' && this.state.trxBalance !== 0) {
      Keyboard.dismiss()
    }
  }

  _handleTokenChange = (index, formattedToken) => {
    if (index > 0) {
      this.setState({
        tokenId: this.state.balances[index - 1].id,
        formattedToken
      }, this._nextInput('token'))
    }
  }

  render () {
    const {
      loadingSign,
      loadingData,
      tokenId,
      error,
      to,
      amount,
      balances,
      addressError
    } = this.state
    const tokenOptions = balances.map(({ name, balance, id }) => this._formatBalance(name, balance, id))
    const balanceSelected = balances.find(b => b.id === tokenId) || balances[0]
    tokenOptions.unshift(tl.t('cancel'))
    return (
      <Utils.SafeAreaView>
        <KeyboardScreen>
          <NavigationHeader
            title={tl.t('send.title')}
            onBack={() => this.props.navigation.goBack()}
          />
          <ScrollView>
            <Utils.Content>
              <ActionSheet
                ref={ref => {
                  this.ActionSheet = ref
                }}
                styles={{messageText: { fontSize: 6 }}}
                title={tl.t('send.chooseToken')}
                options={tokenOptions}
                cancelButtonIndex={0}
                onPress={index =>
                  this._handleTokenChange(index, tokenOptions[index])
                }
              />
              <TouchableOpacity onPress={() => this.ActionSheet.show()}>
                <Input
                  label={tl.t('send.input.token')}
                  value={this.state.formattedToken}
                  rightContent={this._rightContentToken}
                  editable={false}
                />
              </TouchableOpacity>
              <Utils.VerticalSpacer size='medium' />
              <Input
                innerRef={input => {
                  this.to = input
                }}
                label={tl.t('send.input.to')}
                rightContent={this._rightContentTo}
                value={to}
                onChangeText={to => this._changeAddress(to)}
                onSubmitEditing={() => this._nextInput('to')}
              />
              {addressError && (
                <React.Fragment>
                  <Utils.Text size='xsmall' color='#ff5454'>
                    {addressError}
                  </Utils.Text>
                </React.Fragment>
              )}
              <Modal
                visible={this.state.QRModalVisible}
                onRequestClose={this._closeModal}
                animationType='slide'
              >
                <QRScanner
                  onRead={this._readPublicKey}
                  onClose={this._closeModal}
                  checkAndroid6Permissions
                />
              </Modal>
              <Utils.VerticalSpacer size='medium' />
              <Input
                innerRef={input => {
                  this.amount = input
                }}
                label={tl.t('send.input.amount')}
                keyboardType='numeric'
                value={amount}
                placeholder='0'
                onChangeText={text => this._changeInput(text, 'amount')}
                onSubmitEditing={() => this._nextInput('description')}
                rightContent={this._rightContentAmount}
                align='right'
                type='float'
                numbersOnly
              />
              <Utils.Text light size='xsmall' secondary>{tl.t('send.minimumAmount')}</Utils.Text>
              <Utils.VerticalSpacer size='medium' />
              <Input
                innerRef={input => {
                  this.description = input
                }}
                label={tl.t('send.input.description')}
                onChangeText={text => this._changeInput(text, 'description')}
              />
              {error && (
                <React.Fragment>
                  <Utils.Error>{error}</Utils.Error>
                </React.Fragment>
              )}
              <Utils.VerticalSpacer size='large' />
              {loadingSign || loadingData ? (
                <ActivityIndicator size='small' color={Colors.primaryText} />
              ) : (
                <ButtonGradient
                  font='bold'
                  text={tl.t('send.title')}
                  onPress={this._submit}
                  disabled={
                    Number(amount) <= 0 ||
                    Number(balanceSelected.balance) < Number(amount) ||
                    !isAddressValid(to)
                  }
                />
              )}
            </Utils.Content>
          </ScrollView>
        </KeyboardScreen>
      </Utils.SafeAreaView>
    )
  }
}

export default withContext(SendScene)
