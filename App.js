import React, { Component } from 'react'
import { StatusBar, Platform, YellowBox, AsyncStorage, View } from 'react-native'
import axios from 'axios'
import Config from 'react-native-config'
import OneSignal from 'react-native-onesignal'
import Mixpanel from 'react-native-mixpanel'
import { Sentry } from 'react-native-sentry'
import DeviceInfo from 'react-native-device-info'

import { logSentry } from './src/utils/sentryUtils'
import RootNavigator from './Router'
import StatusMessage from './src/components/StatusMessage'
import { Colors } from './src/components/DesignSystem'

import Client from './src/services/client'
import { Context } from './src/store/context'
import NodesIp from './src/utils/nodeIp'
import { getUserSecrets } from './src/utils/secretsUtils'
import getBalanceStore from './src/store/balance'
import { USER_PREFERRED_CURRENCY, ALWAYS_ASK_PIN, TOKENS_VISIBLE, USER_STATUS, USER_FILTERED_TOKENS } from './src/utils/constants'
import { ONE_SIGNAL_KEY, MIXPANEL_TOKEN } from './config'
import ConfigJson from './package.json'
import SecretStore from './src/store/secrets'
import onBackgroundHandler from './src/utils/onBackgroundHandler'
import { getActiveRouteName } from './src/utils/navigationUtils'

import Async from './src/utils/asyncStorageUtils'

import { getFixedTokens } from './src/services/contentful'
import NavigationService from './src/utils/hocs/NavigationServices'
// import './ReactotronConfig'

if (!__DEV__) { // eslint-disable-line
  Sentry.config('https://8ffba48a3f30473883ba930c49ab233d@sentry.io/1236809', {
    disableNativeIntegration: Platform.OS === 'android',
    release: ConfigJson.version
  }).install()
}
Mixpanel.sharedInstanceWithToken(MIXPANEL_TOKEN)
  .then(() => {
    Mixpanel.identify(DeviceInfo.getUniqueID())
  })

YellowBox.ignoreWarnings(['Warning: isMounted(...) is deprecated', 'Module RCTImageLoader'])

const prefix = Platform.OS === 'android' ? 'tronwalletmobile://tronwalletmobile/' : 'tronwalletmobile://'

class App extends Component {
  state = {
    price: {},
    freeze: {},
    balances: {},
    accounts: [],
    userSecrets: [],
    publicKey: null,
    pin: null,
    oneSignalId: null,
    shareModal: false,
    queue: null,
    alwaysAskPin: true,
    currency: null,
    secretMode: 'mnemonic',
    verifiedTokensOnly: true,
    fixedTokens: ['TRX', 'TWX'],
    hasUnreadNotification: false
  }

  componentDidMount () {
    setTimeout(() => {
      OneSignal.init(ONE_SIGNAL_KEY, { kOSSettingsKeyAutoPrompt: true })
      OneSignal.inFocusDisplaying(2)

      OneSignal.addEventListener('received', this._onReceived)
      OneSignal.addEventListener('opened', this._onOpened)
      OneSignal.addEventListener('ids', this._onIds)
      OneSignal.configure()
    }, 1000)

    this._setNodes()
    this._bootstrapAsync()

    this.appStateListener = onBackgroundHandler(this._onAppStateChange)
  }

  componentWillUnmount () {
    OneSignal.removeEventListener('ids', this._onIds)
    OneSignal.removeEventListener('opened', this._onOpened)
    OneSignal.removeEventListener('received', this._onReceived)
    this.appStateListener.remove()
  }

  _bootstrapAsync = () => {
    return Promise.all([
      Async.get(ALWAYS_ASK_PIN, 'true').then(data => JSON.parse(data)),
      Async.get(USER_STATUS, null),
      Async.get(USER_FILTERED_TOKENS, null),
      getFixedTokens(),
      Async.get(TOKENS_VISIBLE).then(data => JSON.parse(data)),
      Async.get(USER_PREFERRED_CURRENCY, 'TRX')
    ]).then(results => {
      const [alwaysAskPin, useStatus, filteredTokens, fixedTokens, verifiedTokensOnly, currency] = results

      if (useStatus === 'active') {
        this._requestPIN()
      } else {
        NavigationService.navigate('FirstTime', {
          shouldDoubleCheck: useStatus !== 'reset',
          testInput: this._tryToOpenStore
        })
      }
      this.setState({ alwaysAskPin, fixedTokens, verifiedTokensOnly, currency }, () => {
        this._getPrice(currency)
      })

      if (filteredTokens === null) {
        Async.set(USER_FILTERED_TOKENS, '[]')
      }
    })
      .catch(error => {
        logSentry(error, 'App - Bootstrap')
      })
  }

  _onAppStateChange = (nextAppState) => {
    const { alwaysAskPin, pin } = this.state
    if (nextAppState.match(/background/)) {
      if (alwaysAskPin) {
        NavigationService.navigate('Pin', {
          testInput: resultPIN => resultPIN === pin,
          onSuccess: () => {
            if (NavigationService.hasNotification()) {
              NavigationService.checkNotifications()
            }
          }
        })
      }
    }
  }

  _requestPIN = () => {
    NavigationService.navigate('Pin', {
      testInput: this._tryToOpenStore,
      onSuccess: this._handleSuccess
    })
  }

  _navigate = () => {
    NavigationService.goToMainScreen()
    if (NavigationService.hasNotification()) {
      NavigationService.checkNotifications()
    }
  }

  _handleSuccess = pinValue => {
    setTimeout(() => {
      this._setPin(pinValue, this._navigate)
    }, 2000)
  }

  _tryToOpenStore = async pin => {
    try {
      await SecretStore(pin)
      this._getRestoreMode(pin)
      return true
    } catch (e) {
      return false
    }
  }

  _getRestoreMode = async pin => {
    const accounts = await getUserSecrets(pin)
    if (accounts.length) {
      const mode = accounts[0].mnemonic ? 'mnemonic' : 'privatekey'
      this._setSecretMode(mode)
    }
  }

  _onIds = device => {
    this.setState({ oneSignalId: device.userId })
  }

  _onReceived = (notification) => {
    this.setState({
      hasUnreadNotification: true
    })
  }

  _onOpened = ({ notification }) => {
    NavigationService.setNotification(notification.payload.additionalData)
    if (notification.isAppInFocus) {
      NavigationService.checkNotifications()
    }
  }

  _loadUserData = async () => {
    // accounts = filtered accounts by hidden status
    // userSecrets =  ref to all userSecrets
    let accounts = await getUserSecrets(this.state.pin)
    const userSecrets = accounts
    // First Time
    if (!accounts.length) return null

    // merge store with state
    accounts = accounts
      .filter(account => !account.hide)
      .map(account => {
        const stateAccount = this.state.accounts.find(item => item.address === account.address)
        return Object.assign({}, stateAccount, account)
      })

    const publicKey = this.state.publicKey || accounts[0].address
    this.setState({ accounts, userSecrets, publicKey }, () => this._updateAccounts(accounts))
  }

  _updateAccounts = async (accountsArray = []) => {
    const accountDataArray = await Promise.all(accountsArray.map(acc => Client.getAccountData(acc.address)))
    const updatedBalanceData = {}
    const updatedFreezeData = {}
    const updatedAccounDataArray = accountsArray.map((prevAccount, index) => {
      const { balanceTotal, freezeData, balancesData } = accountDataArray
        .find(ada => ada.address === prevAccount.address)

      updatedBalanceData[prevAccount.address] = balancesData
      updatedFreezeData[prevAccount.address] = freezeData

      prevAccount.balance = balanceTotal
      prevAccount.tronPower = freezeData.total
      prevAccount.bandwidth = freezeData.bandwidth.netRemaining + freezeData.bandwidth.freeNetRemaining

      getBalanceStore().then(store => {
        store.write(() => {
          balancesData.map(item =>
            store.create('Balance', {
              ...item,
              account: prevAccount.address,
              id: `${prevAccount.address}${item.name}`
            }, true))
        })
      })

      return prevAccount
    })

    this.setState({ accounts: updatedAccounDataArray, balances: updatedBalanceData, freeze: updatedFreezeData })
  }

  _setCurrency = currency => {
    this.setState({ currency }, () => AsyncStorage.setItem(USER_PREFERRED_CURRENCY, currency))
    if (!this.state.price[currency]) {
      this._getPrice(currency)
    }
  }

  _getPrice = async (currency = 'TRX') => {
    try {
      const { data: { data } } = await axios.get(`${Config.TRX_PRICE_API}/?convert=${currency}`)
      const { price } = this.state
      price[currency] = data.quotes[currency]
      if (currency !== 'USD') {
        price.USD = data.quotes.USD
      }
      this.setState({ price, circulatingSupply: data.circulating_supply })
    } catch (e) {
      logSentry(e, 'App - GetPrice')
    }
  }

  _setNodes = async () => {
    try {
      await NodesIp.initNodes()
    } catch (e) {
      logSentry(e, 'App - SetNodes')
    }
  }

  _setSecretMode = mode => this.setState({ secretMode: mode })

  _setPublicKey = publicKey => this.setState({ publicKey })

  _setAskPin = (alwaysAskPin) => this.setState({ alwaysAskPin })

  _setUseBiometry = (useBiometry) => this.setState({ useBiometry })

  _setVerifiedTokensOnly = (verifiedTokensOnly) => this.setState({ verifiedTokensOnly })

  _setPin = (pin, callback) => {
    this.setState({ pin }, callback)
  }

  _resetAccounts = () => {
    this.setState({ accounts: [], publicKey: null })
  }

  _hideAccount = address => {
    const newAccounts = this.state.accounts.filter(acc => acc.address !== address)
    this.setState({ accounts: newAccounts })
  }

  _getCurrentAccount = () => {
    const { publicKey, accounts } = this.state
    return accounts.find(account => account.address === publicKey)
  }

  render () {
    const contextProps = {
      ...this.state,
      loadUserData: this._loadUserData,
      getPrice: this._getPrice,
      setPublicKey: this._setPublicKey,
      setPin: this._setPin,
      setCurrency: this._setCurrency,
      resetAccount: this._resetAccounts,
      hideAccount: this._hideAccount,
      setAskPin: this._setAskPin,
      setUseBiometry: this._setUseBiometry,
      setSecretMode: this._setSecretMode,
      setVerifiedTokensOnly: this._setVerifiedTokensOnly,
      getCurrentAccount: this._getCurrentAccount
    }

    return (
      <View style={{ backgroundColor: Colors.background, flex: 1 }} >
        <Context.Provider value={contextProps}>
          <StatusBar barStyle='light-content' />
          <StatusMessage
            ref={ref => {
              this.statusMSGref = ref
            }}
          />
          <RootNavigator
            uriPrefix={prefix}
            ref={navigatorRef => {
              NavigationService.setTopLevelNavigator(navigatorRef)
            }}
            onNavigationStateChange={(prevState, currentState) => {
              const currentScreen = getActiveRouteName(currentState)
              const prevScreen = getActiveRouteName(prevState)
              if (prevScreen !== currentScreen) {
                if (this.statusMSGref) {
                  this.statusMSGref.checkStatus()
                }
              }
            }}
          />
        </Context.Provider>
      </View>
    )
  }
}

export default App
