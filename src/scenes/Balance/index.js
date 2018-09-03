import React, { Component } from 'react'
import {
  RefreshControl,
  ScrollView,
  AsyncStorage,
  TouchableOpacity,
  AppState
} from 'react-native'
import { Answers } from 'react-native-fabric'
import Feather from 'react-native-vector-icons/Feather'

import SyncButton from '../../components/SyncButton'
import NavigationHeader from '../../components/Navigation/Header'
import * as Utils from '../../components/Utils'
import WalletBalances from './WalletBalances'
import BalanceWarning from './BalanceWarning'
import BalanceNavigation from './BalanceNavigation'
import AccountsCarousel from './AccountsCarousel'

import tl from '../../utils/i18n'
import { USER_PREFERRED_CURRENCY } from '../../utils/constants'
import { createNewAccount } from '../../utils/secretsUtils'
import { updateAssets } from '../../utils/assetsUtils'
import withContext from '../../utils/hocs/withContext'
import { logSentry } from '../../utils/sentryUtils'

const REFRESH_TIME = 45 * 1000

class BalanceScene extends Component {
  static navigationOptions = {
    header: null
  }

  state = {
    refreshing: false,
    creatingNewAccount: false,
    error: null,
    balances: [],
    currency: null,
    appState: AppState.currentState
  }

  componentDidMount () {
    Answers.logContentView('Tab', 'Balance')
    try {
      this._loadData()
    } catch (e) {
      this.setState({ error: tl.t('balance.error.loadingData') })
      logSentry(e, 'Balance - LoadData')
    }

    this._navListener = this.props.navigation.addListener('didFocus', this._loadData)

    this.refreshInterval = setInterval(this._onInterval, REFRESH_TIME)

    AppState.addEventListener('change', this._handleAppStateChange)

    // Update assets when you enter the wallet
    updateAssets()
  }

  componentWillUnmount () {
    this._navListener.remove()
    clearInterval(this.refreshInterval)
    AppState.removeEventListener('change', this._handleAppStateChange)
  }

  _addNewAccount = async () => {
    this.setState({ creatingNewAccount: true })
    const createdNewAccount = await createNewAccount(this.props.context.pin, this.props.context.oneSignalId)
    if (createdNewAccount) {
      await this.props.context.loadUserData()
      this.carousel.innerComponent._snapToNewAccount()
    }
    this.setState({ creatingNewAccount: false })
  }

  _onInterval = async () => {
    if (!this.state.refreshing) {
      await this.props.context.loadUserData()
      this._loadData()
    }
  }

  _onRefresh = async () => {
    this.setState({ refreshing: true })
    await this.props.context.loadUserData()
    await this._loadData()
    this.setState({ refreshing: false })
  }

  _handleAppStateChange = nextAppState => {
    const { appState } = this.state
    const { alwaysAskPin } = this.props.context
    if (nextAppState.match(/inactive|background/) && appState === 'active' && alwaysAskPin) {
      this.props.navigation.navigate('Pin', {
        testInput: pin => pin === this.props.context.pin,
        onSuccess: () => {}
      })
    }
    this.setState({ appState: nextAppState })
  }

  _loadData = async () => {
    try {
      const { getFreeze, accounts } = this.props.context
      const preferedCurrency = await AsyncStorage.getItem(USER_PREFERRED_CURRENCY)
      const currency = preferedCurrency || 'USD'
      accounts.map(account => getFreeze(account.address))
      this.props.context.setCurrency(currency)
    } catch (e) {
      this.setState({ error: e.message })
      logSentry(e, 'Balance - LoadAccounts')
    }
  }

  _rightButtonHeader = () => {
    const { importedPk } = this.props.context
    const { creatingNewAccount } = this.state
    if (importedPk) {
      return <TouchableOpacity onPress={this._addNewAccount} disabled={creatingNewAccount}>
        {creatingNewAccount
          ? <SyncButton
            loading
            onPress={() => { }}
          />
          : <Feather name='plus' color={'white'} size={28} />
        }
      </TouchableOpacity>
    } else {
      return null
    }
  }

  render () {
    const {
      seed,
      refreshing
    } = this.state
    const {
      accounts,
      balances,
      publicKey
    } = this.props.context
    return (
      <React.Fragment>
        <NavigationHeader
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
              <BalanceNavigation navigation={this.props.navigation} />
              {accounts[0] && !accounts[0].confirmed && (
                <BalanceWarning seed={seed} navigation={this.props.navigation}>
                  {tl.t('balance.confirmSeed')}
                </BalanceWarning>
              )}
              <WalletBalances balances={balances[publicKey]} />
            </Utils.Content>
          </ScrollView>
        </Utils.Container>
      </React.Fragment>
    )
  }
}

export default withContext(BalanceScene)
