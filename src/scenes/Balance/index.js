import qs from 'qs'
import React, { Component } from 'react'
import { RefreshControl, ScrollView, TouchableOpacity, Linking, Alert } from 'react-native'
import { Answers } from 'react-native-fabric'
import Feather from 'react-native-vector-icons/Feather'
import Ionicons from 'react-native-vector-icons/Ionicons'
import MixPanel from 'react-native-mixpanel'
import DeviceInfo from 'react-native-device-info'

import FormModal from '../../components/FormModal'
import SyncButton from '../../components/SyncButton'
import NavigationHeader from '../../components/Navigation/Header'
import * as Utils from '../../components/Utils'
import WalletBalances from './WalletBalances'
import BalanceNavigation from './BalanceNavigation'
import AccountsCarousel from './AccountsCarousel'
import { ButtonHeader, Badge } from './../../components/Navigation/elements'

import tl from '../../utils/i18n'
import { isNameValid, isAliasUnique } from '../../utils/validations'
import { formatAlias } from '../../utils/contactUtils'
import { createNewAccount } from '../../utils/secretsUtils'
import withContext from '../../utils/hocs/withContext'
import { logSentry } from '../../utils/sentryUtils'
import onBackgroundHandler from '../../utils/onBackgroundHandler'
import { Colors } from './../../components/DesignSystem'

export class BalanceScene extends Component {
  static navigationOptions = {
    header: null
  }

  state = {
    refreshing: false,
    creatingNewAccount: false,
    error: null,
    balances: [],
    currency: null,
    accountModalVisible: false,
    newAccountName: ''
  }

  componentDidMount () {
    Answers.logContentView('Tab', 'Balance')
    this._navListener = this.props.navigation.addListener('didFocus', this._loadData)
    this.appStateListener = onBackgroundHandler(this._onAppStateChange)

    Linking
      .getInitialURL()
      .then(url => this.handleOpenURL(url))
      .catch(err => console.error('An error occurred 2', err))

    Linking.addEventListener('url', ({ url }) => this.handleOpenURL(url, true))
  }

  componentWillUnmount () {
    Linking.removeEventListener('url', this.handleOpenURL)
    this._navListener.remove()
    this.appStateListener.remove()
  }

  handleOpenURL = (url, fromBackground) => {
    if (url) {
      const route = url.replace(/.*?:\/\//g, '') // eslint-disable-line no-useless-escape.
      const querystring = route.match(/\/([^/]+)\/?$/)[1] // eslint-disable-line no-useless-escape.
      const routeName = route.split('/')[0]

      const data = qs.parse(querystring)

      const isValidData = data && data.amount && data.address && data.command

      if (routeName === 'contract' && isValidData) {
        if (fromBackground) {
          return this.props.navigation.navigate('Pin', {
            testInput: pin => pin === this.props.context.pin,
            onSuccess: () => this.props.navigation.navigate('ContractPreview', { ...data })
          })
        }
        return this.props.navigation.navigate('ContractPreview', { ...data })
      }

      return Alert.alert('Invalid smart contract')
    }
  }

  _loadData = async () => {
    try {
      await this.props.context.loadUserData()
      const currentAccount = this.props.context.getCurrentAccount()
      if (currentAccount) {
        MixPanel.identify(currentAccount.address)
        MixPanel.set({
          '$email': currentAccount.address,
          'Address2': currentAccount.address,
          'DeviceId': DeviceInfo.getDeviceId(),
          'DeviceUniqueId': DeviceInfo.getUniqueID()
        })
        MixPanel.trackWithProperties('Balance load', {
          name: currentAccount.name,
          address: currentAccount.address,
          balance: currentAccount.balance || 0
        })
      }
    } catch (e) {
      this.setState({ error: tl.t('balance.error.loadingData') })
      logSentry(e, 'Balance - LoadData')
    }
  }

  _createAccountPressed = () => {
    const { userSecrets } = this.props.context
    const newAccountName = `Account ${userSecrets.length}`

    this.setState({
      accountModalVisible: true,
      newAccountName,
      accountNameError: null
    })
  }

  _validateAccountName = async name => {
    if (name) {
      if (!isNameValid(name)) {
        return tl.t('addressBook.form.nameError')
      }

      const aliasIsUnique = await isAliasUnique(formatAlias(name), this.props.context.pin)
      if (!aliasIsUnique) {
        return tl.t('addressBook.form.uniqueAliasError')
      }
    }

    return null
  }

  _handleAccountNameChange = async name => {
    const accountNameError = await this._validateAccountName(name)
    this.setState({ newAccountName: name, accountNameError })
  }

  _addNewAccount = async () => {
    const { newAccountName } = this.state
    const { pin, oneSignalId, loadUserData } = this.props.context
    this.setState({ creatingNewAccount: true, accountModalVisible: false })
    try {
      const createdNewAccount = await createNewAccount(pin, oneSignalId, newAccountName)
      if (createdNewAccount) {
        await loadUserData()
        this.carousel.innerComponent._snapToNewAccount()
        MixPanel.trackWithProperties('Create new account', { name: newAccountName })
      }
    } catch (error) {
      logSentry(error, 'Error creating new Account')
    } finally {
      this.setState({ creatingNewAccount: false })
    }
  }

  _onRefresh = async () => {
    this.setState({ refreshing: true })
    await this._loadData()
    this.setState({ refreshing: false })
  }

  _onAppStateChange = nextAppState => {
    if (nextAppState.match(/background/)) {
      // Closing all modals
      this.setState({ accountModalVisible: false })
      if (this.carousel.innerComponent.ActionSheet && this.carousel.innerComponent.ActionSheet.hide) {
        this.carousel.innerComponent.ActionSheet.hide()
      }
    }
  }

  _leftButtonHeader = () => {
    const { hasUnreadNotification } = this.props.context
    return (
      <ButtonHeader onPress={() => this.props.navigation.navigate('Notifications')}>
        <Badge value={hasUnreadNotification}>
          <Ionicons
            name='ios-notifications-outline'
            size={28}
            color={Colors.primaryText}
          />
        </Badge>
      </ButtonHeader>
    )
  }

  _rightButtonHeader = () => {
    const { secretMode } = this.props.context
    const { creatingNewAccount } = this.state
    if (secretMode === 'privatekey') {
      return null
    }

    return (
      <TouchableOpacity onPress={this._createAccountPressed} disabled={creatingNewAccount} >
        {creatingNewAccount
          ? (<SyncButton loading />)
          : (<Feather name='plus' color={'white'} size={28} />)}
      </TouchableOpacity>
    )
  }

  render () {
    const {
      refreshing,
      accountModalVisible,
      newAccountName,
      accountNameError
    } = this.state
    return (
      <Utils.SafeAreaView>
        <NavigationHeader
          leftButton={this._leftButtonHeader()}
          title={tl.t('balance.title')}
          rightButton={this._rightButtonHeader()}
        />
        <Utils.Container justify='flex-start' align='stretch'>
          <ScrollView
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={this._onRefresh}
              />
            }
          >
            <AccountsCarousel ref={input => (this.carousel = input)} />
            <Utils.VerticalSpacer size='medium' />
            <Utils.Content paddingTop={0}>
              <BalanceNavigation />
              <WalletBalances />
            </Utils.Content>
          </ScrollView>
        </Utils.Container>
        <FormModal
          title={tl.t('newAccount.title')}
          error={accountNameError}
          inputLabel={tl.t('addressBook.form.name')}
          inputValue={newAccountName}
          inputPlaceholder={tl.t('newAccount.placeholder')}
          onChangeText={this._handleAccountNameChange}
          buttonText={tl.t(`addressBook.shared.add`)}
          onButtonPress={this._addNewAccount}
          buttonDisabled={!!accountNameError || !newAccountName}
          visible={accountModalVisible}
          closeModal={() => this.setState({ accountModalVisible: false })}
          animationType='fade'
        />
      </Utils.SafeAreaView>
    )
  }
}

export default withContext(BalanceScene)
