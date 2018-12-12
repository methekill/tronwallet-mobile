import React, { Component } from 'react'
import { StyleSheet, Alert, ActivityIndicator, AsyncStorage, SectionList } from 'react-native'
import RNRestart from 'react-native-restart'
import SectionedMultiSelect from 'react-native-sectioned-multi-select'
import ActionSheet from 'react-native-actionsheet'
import Toast from 'react-native-easy-toast'
import { Answers } from 'react-native-fabric'
import { createIconSetFromFontello } from 'react-native-vector-icons'
import { StackActions, NavigationActions } from 'react-navigation'
import OneSignal from 'react-native-onesignal'
import Switch from 'react-native-switch-pro'
import Biometrics from 'react-native-biometrics'
import MixPanel from 'react-native-mixpanel'

// Design
import * as Utils from '../../components/Utils'
import { encrypt } from '../../utils/encrypt'
import { Colors, Spacing } from '../../components/DesignSystem'
import NavigationHeader from '../../components/Navigation/Header'
import { SectionTitle, MultiSelectColors, MultiSelectStyles, ListItem } from './elements'
import ModalWebView from './../../components/ModalWebView'
import AccountRecover from './RecoverAccount'

// Utils
import getBalanceStore from '../../store/balance'
import { USER_PREFERRED_LANGUAGE, USER_FILTERED_TOKENS, ALWAYS_ASK_PIN, USE_BIOMETRY, ENCRYPTED_PIN, TOKENS_VISIBLE } from '../../utils/constants'
import tl, { LANGUAGES } from '../../utils/i18n'
import fontelloConfig from '../../assets/icons/config.json'
import { withContext } from '../../store/context'
import { hardResetWalletData } from '../../utils/userAccountUtils'
import { getUserSecrets, unhideSecret } from '../../utils/secretsUtils'
import Client from '../../services/client'
import { logSentry } from '../../utils/sentryUtils'
import onBackgroundHandler from '../../utils/onBackgroundHandler'

const Icon = createIconSetFromFontello(fontelloConfig, 'tronwallet')

const resetAction = StackActions.reset({
  index: 0,
  actions: [NavigationActions.navigate({ routeName: 'Loading' })],
  key: null
})

class Settings extends Component {
  static navigationOptions = {
    header: null
  }

  state = {
    seed: null,
    loading: true,
    modalVisible: false,
    uri: '',
    subscriptionStatus: null,
    changingSubscription: false,
    userTokens: [],
    userSelectedTokens: [],
    currentSelectedTokens: [],
    hiddenAccounts: [],
    biometricsEnabled: true,
    tokenFilterModal: false,
    accountsModal: false
  }

  componentDidMount () {
    Biometrics.isSensorAvailable()
      .then((biometryType) => {
        if (biometryType === Biometrics.TouchID || biometryType === Biometrics.FaceID) {
          this.setState({ biometricsEnabled: true })
        }
      })

    Answers.logContentView('Tab', 'Settings')
    this._onLoadData()
    this._getSelectedTokens()
    OneSignal.getPermissionSubscriptionState(
      status => {
        this.setState({ subscriptionStatus: `${status.userSubscriptionEnabled}` === 'true' })
      }
    )
    this._didFocus = this.props.navigation.addListener('didFocus', () => this._onLoadData(), this._getSelectedTokens)
    this.appStateListener = onBackgroundHandler(this._onAppStateChange)
    MixPanel.trackWithProperties('Settings Operation', { type: 'Load data' })
  }

  componentWillUnmount () {
    this._didFocus.remove()
    this.appStateListener.remove()
  }

  _getPinCallback = (onSuccess, shouldGoBack = true) => {
    this.props.navigation.navigate('Pin', {
      testInput: pin => pin === this.props.context.pin,
      shouldGoBack,
      onSuccess
    })
  }

  _onAppStateChange = nextAppState => {
    const { accountsModal, tokenFilterModal } = this.state
    if (nextAppState.match(/background/)) {
      let accState = accountsModal
      let tokenFilter = tokenFilterModal
      // This is ugly because of React Native MultiSectioned Lib
      if (tokenFilterModal) {
        this.SectionedMultiSelect._toggleSelector()
        tokenFilter = false
      }
      if (accountsModal) {
        this.AccountRecover.innerComponent._toggleSelector()
        accState = false
      }
      if (this.ActionSheet && this.ActionSheet.hide) this.ActionSheet.hide()

      this.setState({ modalVisible: false, accountsModal: accState, tokenFilterModal: tokenFilter })
    }
  }

  _onLoadData = async () => {
    const accounts = await getUserSecrets(this.props.context.pin)
    const hiddenAccounts = accounts.filter(account => account.hide)
    // When hard reseting wallet data will be empty
    const seed = accounts.length ? accounts[0].mnemonic : this.state.seed
    this.setState({ seed, loading: false, hiddenAccounts })
  }

  _getSelectedTokens = async () => {
    try {
      const store = await getBalanceStore()
      const tokens = store.objects('Balance')
        .filtered('TRUEPREDICATE DISTINCT(name)')
        .filter(({ name }) => name !== 'TRX')
        .map(({ name }) => ({ id: name, name }))

      const filteredTokens = await AsyncStorage.getItem(USER_FILTERED_TOKENS)
      const selectedTokens = filteredTokens ? JSON.parse(filteredTokens) : []

      this.setState({
        userTokens: tokens,
        userSelectedTokens: selectedTokens,
        currentSelectedTokens: selectedTokens
      })
    } catch (error) {
      logSentry(error, 'Settings - Selected tokens')
    }
  }

  _setAskPin = async () => {
    const { alwaysAskPin } = this.props.context
    await AsyncStorage.setItem(ALWAYS_ASK_PIN, `${!alwaysAskPin}`)
    this.props.context.setAskPin(!alwaysAskPin)
    MixPanel.trackWithProperties('Settings Operation', { type: 'Setting ask pin', value: !alwaysAskPin })
  }

  _resetWallet = async () => {
    Alert.alert(
      tl.t('warning'),
      tl.t('settings.reset.warning'),
      [
        { text: tl.t('cancel'), style: 'cancel' },
        {
          text: tl.t('settings.reset.button'),
          onPress: () => this.props.navigation.navigate('Pin', {
            shouldGoBack: true,
            testInput: pin => pin === this.props.context.pin,
            onSuccess: async () => {
              await hardResetWalletData(this.props.context.pin)
              this.props.context.resetAccount()
              this.props.navigation.dispatch(resetAction)
              MixPanel.trackWithProperties('Settings Operation', { type: 'Reset Wallet' })
            }
          })
        }
      ],
      { cancelable: false }
    )
  }

  _onUnhideAccounts = async (accountsSelected = []) => {
    const { loadUserData, pin } = this.props.context
    this.setState({ accountsModal: false })
    if (!accountsSelected.length) return
    try {
      await unhideSecret(pin, accountsSelected)
      this._onLoadData()
      loadUserData()
    } catch (error) {
      logSentry(error, 'Hide Accounts Error')
    }
  }

  _changePin = () => {
    this.props.navigation.navigate('Pin', {
      shouldGoBack: true,
      testInput: pin => pin === this.props.context.pin,
      onSuccess: () => {
        this.props.navigation.navigate('Pin', {
          shouldDoubleCheck: true,
          shouldGoBack: true,
          onSuccess: pin => this.props.context.setPin(pin, () => this.refs.settingsToast.show(tl.t('settings.pin.success')))
        })
      }
    })
  }

  _changeSubscription = () => {
    this.setState(
      ({ subscriptionStatus }) => ({ subscriptionStatus: !subscriptionStatus }),
      () => {
        OneSignal.setSubscription(this.state.subscriptionStatus)
        OneSignal.getPermissionSubscriptionState(
          status => console.log('subscriptions status', status)
        )
        if (this.state.subscriptionStatus) {
          Client.registerDeviceForNotifications(
            this.props.context.oneSignalId,
            this.props.context.publicKey
          )
        } else {
          // TODO: remove device from db
        }
      }
    )
  }

  _changeTokensVisibility = async currentValue => {
    try {
      await AsyncStorage.setItem(TOKENS_VISIBLE, `${!this.props.context.verifiedTokensOnly}`)
      this.props.context.setVerifiedTokensOnly(!this.props.context.verifiedTokensOnly)
      MixPanel.trackWithProperties('Settings Operation', { type: 'Change tokens visibility' })
    } catch (error) {
      this.props.context.setVerifiedTokensOnly(currentValue)
    }
  }

  _openLink = (uri) => this.setState({ modalVisible: true, uri })

  _handleLanguageChange = async (index) => {
    if (index > 0) {
      const language = LANGUAGES[index]
      try {
        await AsyncStorage.setItem(USER_PREFERRED_LANGUAGE, language.key)
        Alert.alert(
          tl.t('settings.language.success.title', { language: language.value }),
          tl.t('settings.language.success.description'),
          [
            { text: tl.t('settings.language.button.cancel'), style: 'cancel' },
            {
              text: tl.t('settings.language.button.confirm'),
              onPress: () => {
                MixPanel.trackWithProperties('Settings Operation', { type: 'Change language', value: language.value })
                RNRestart.Restart()
              }
            }
          ],
          { cancelable: false }
        )
      } catch (e) {
        this.refs.settingsToast.show(tl.t('settings.language.error'))
        logSentry(e, 'Settings - Language Change')
      }
    }
  }

  _saveSelectedTokens = async () => {
    const { currentSelectedTokens } = this.state
    try {
      await AsyncStorage.setItem(USER_FILTERED_TOKENS, JSON.stringify(currentSelectedTokens))
      this.setState({ userSelectedTokens: currentSelectedTokens })
      MixPanel.trackWithProperties('Settings Operation', { type: 'Token filter' })
    } catch (error) {
      logSentry(error, 'Settings - Save tokens')
    }
  }

  _saveBiometry = async (pin) => {
    const { useBiometry } = this.props.context
    try {
      if (!useBiometry) {
        await Biometrics.createKeys(tl.t('biometry.register.title'))
        const signature = await Biometrics.createSignature(tl.t('biometry.register.title'), '')
        await AsyncStorage.setItem(ENCRYPTED_PIN, encrypt(pin, signature))
      }
      await AsyncStorage.setItem(USE_BIOMETRY, `${!useBiometry}`)
      this.props.context.setUseBiometry(!useBiometry)
      MixPanel.trackWithProperties('Settings Operation', { type: 'Save Biometry', value: !useBiometry })
    } catch (error) {
      logSentry(error, 'Settings - Save Biometry')
      Alert.alert(tl.t('biometry.auth.title'), tl.t('biometry.auth.error'))
    }
  }

  _renderNoResults = () => (
    <Utils.Text lineHeight={20} size='small' color={Colors.primaryText}>
      {tl.t('settings.token.noResult')}
    </Utils.Text>
  )

  _showTokenSelect = () => {
    const { userSelectedTokens, tokenFilterModal } = this.state
    this.setState({
      currentSelectedTokens: userSelectedTokens,
      tokenFilterModal: !tokenFilterModal
    })

    this.SectionedMultiSelect._toggleSelector()
  }

  _renderList = () => {
    const { seed, userTokens } = this.state
    const { secretMode } = this.props.context
    const list = [
      {
        title: tl.t('settings.sectionTitles.wallet'),
        data: [
          {
            title: tl.t('settings.market.title'),
            icon: 'graph,-bar,-chart,-statistics,-analytics',
            onPress: () => this.props.navigation.navigate('Market')
          },
          {
            title: tl.t('settings.token.title'),
            icon: 'sort,-filter,-arrange,-funnel,-filter',
            hide: userTokens.length === 0,
            onPress: this._showTokenSelect
          },
          {
            title: tl.t('settings.about.title'),
            icon: 'question-mark,-circle,-sign,-more,-info',
            onPress: () => this.props.navigation.navigate('About')
          },
          {
            title: tl.t('settings.helpCenter.title'),
            icon: 'message,-chat,-bubble,-text,-rounded',
            onPress: () => {
              this.helpView.open('https://help.tronwallet.me/')
            }
          },
          {
            title: tl.t('settings.verifiedTokensOnly'),
            icon: 'guarantee',
            right: () => (
              <Switch
                circleStyle={{ backgroundColor: Colors.orange }}
                backgroundActive={Colors.yellow}
                backgroundInactive={Colors.secondaryText}
                value={this.props.context.verifiedTokensOnly}
                onSyncPress={this._changeTokensVisibility}
              />
            )
          }
        ]
      },
      {
        title: tl.t('settings.sectionTitles.security'),
        data: [
          {
            title: tl.t('settings.backup.title'),
            icon: 'key,-password,-lock,-privacy,-login',
            hide: secretMode === 'privatekey',
            onPress: () => {
              this._getPinCallback(() => {
                this.props.navigation.navigate('SeedSave', { seed })
              })
            }
          },
          {
            title: tl.t('settings.restore.title'),
            icon: 'folder-sync,-data,-folder,-recovery,-sync',
            onPress: () => {
              this._getPinCallback(() => {
                this.props.navigation.navigate('SeedRestore')
              })
            }
          },
          {
            title: tl.t('settings.reset.title'),
            icon: 'delete,-trash,-dust-bin,-remove,-recycle-bin',
            onPress: this._resetWallet
          },
          {
            title: tl.t('settings.askPin'),
            icon: 'lock,-secure,-safety,-safe,-protect',
            right: () => {
              return (
                <Switch
                  circleStyle={{ backgroundColor: Colors.orange }}
                  backgroundActive={Colors.yellow}
                  backgroundInactive={Colors.secondaryText}
                  value={this.props.context.alwaysAskPin}
                  onAsyncPress={(callback) => {
                    this.props.navigation.navigate('Pin', {
                      shouldGoBack: true,
                      testInput: pin => pin === this.props.context.pin,
                      onSuccess: () => this._setAskPin()
                    })
                    /* eslint-disable */
                    callback(false)
                    /* eslint-disable */
                  }}
                />
              )
            }
          },
          {
            title: tl.t('settings.askBiometry'),
            icon: 'lock,-secure,-safety,-safe,-protect',
            right: () => {
              return this.state.biometricsEnabled ?
                (
                  <Switch
                    circleStyle={{ backgroundColor: Colors.orange }}
                    backgroundActive={Colors.yellow}
                    backgroundInactive={Colors.secondaryText}
                    value={this.props.context.useBiometry}
                    onAsyncPress={(callback) => {        
                      this._getPinCallback((pin) => {
                        this._saveBiometry(pin)
                      })
                      /* eslint-disable */
                      callback(false)
                      /* eslint-disable */
                    }}
                  />
                ) : (
                  <Icon
                    name={'lock,-secure,-safety,-safe,-protect'}
                    size={22}
                    color={Colors.secondaryText}
                  />
                )
            }
          }
        ]
      },
      {
        title: tl.t('settings.sectionTitles.notification'),
        data: [
          {
            title: tl.t('settings.notifications.title'),
            icon: 'user,-person,-avtar,-profile-picture,-dp',
            right: () => {
              if ((this.state.subscriptionStatus === null) || this.state.changingSubscription) {
                return <ActivityIndicator size='small' color={Colors.primaryText} />
              }
              return (
                <Switch
                  circleStyle={{ backgroundColor: Colors.orange }}
                  backgroundActive={Colors.yellow}
                  backgroundInactive={Colors.secondaryText}
                  value={this.state.subscriptionStatus}
                  onSyncPress={this._changeSubscription}
                />
              )
            }
          },
          {
            title: tl.t('notifications.notifications.title'),
            icon: 'message,-chat,-bubble,-text,-rounded',
            onPress: () => this.props.navigation.navigate('Notifications'),
            hide: this.state.subscriptionStatus === null
          },
          {
            title: tl.t('notifications.signals.title'),
            icon: 'message,-chat,-bubble,-text,-rounded',
            onPress: () => this.props.navigation.navigate('Signals'),
            hide: this.state.subscriptionStatus === null
          }
        ]
      },
      {
        title: tl.t('settings.sectionTitles.idiomAndLocalization'),
        data: [
          {
            title: tl.t('settings.language.title'),
            icon: 'earth,-globe,-planet,-world,-universe',
            onPress: () => this.ActionSheet.show()
          }
        ]
      }, {
        title: tl.t('settings.sectionTitles.accounts'),
        data: [
          {
            title: tl.t('settings.accounts.restoreAccounts'),
            icon: 'files,-agreement,-notes,-docs,-pages',
            onPress: () => {
              if (this.state.hiddenAccounts.length) {
                this.setState({ accountsModal: !this.state.accountsModal })
                this.AccountRecover.innerComponent._toggleSelector()
              } else {
                Alert.alert(tl.t('account'), tl.t('settings.accounts.noAccounts'))
              }
            }
          },
        ]
      }
    ]

    return (
      <SectionList
        sections={list}
        renderSectionHeader={({ section }) => <SectionTitle>{section.title}</SectionTitle>}
        renderItem={({ item, index, section }) => item.hide ? null : <ListItem {...item} />}
        keyExtractor={(item, index) => item.title}
        stickySectionHeadersEnabled={false}
      />
    )
  }

  render() {
    const {
      userTokens,
      currentSelectedTokens,
      uri,
      tokenFilterModal,
      modalVisible,
      accountsModal,
      hiddenAccounts } = this.state
    const languageOptions = LANGUAGES.map(language => language.value)

    return (
      <Utils.SafeAreaView>
        <NavigationHeader title={tl.t('menu.title')} />
        <Utils.Container keyboardShouldPersistTaps='always' keyboardDismissMode='interactive'> 
          <SectionedMultiSelect
            ref={ref => { this.SectionedMultiSelect = ref }}
            items={userTokens}
            uniqueKey='id'
            onSelectedItemsChange={(selected) => this.setState({ currentSelectedTokens: selected })}
            selectedItems={currentSelectedTokens}
            onConfirm={this._saveSelectedTokens}
            onCancel={() => this.setState({ tokenFilterModal: !tokenFilterModal })}
            showChips={false}
            showCancelButton
            hideSelect
            searchPlaceholderText={tl.t('settings.token.search')}
            confirmText={tl.t('settings.token.confirm')}
            noResultsComponent={this._renderNoResults()}
            colors={MultiSelectColors}
            styles={MultiSelectStyles}
          />
          <AccountRecover
            ref={ref => { this.AccountRecover = ref }}
            hiddenAccounts={hiddenAccounts}
            onUnhide={this._onUnhideAccounts}
            renderNoResults={this._renderNoResults}
            onCancel={() => this.setState({ accountsModal: !accountsModal })}
          />
          {this._renderList()}
          <ActionSheet
            ref={ref => { this.ActionSheet = ref }}
            title={tl.t('settings.language.choose')}
            options={languageOptions}
            cancelButtonIndex={0}
            onPress={index => this._handleLanguageChange(index)}
          />
          <Toast
            ref='settingsToast'
            position='top'
            fadeInDuration={1250}
            fadeOutDuration={1250}
            opacity={0.8}
          />
        </Utils.Container>
        <ModalWebView ref={ref=> this.helpView = ref} />
      </Utils.SafeAreaView>
    )
  }
}


const styles = StyleSheet.create({
  card: {
    width: '100%',
    borderRadius: 8,
    margin: Spacing.medium,
    backgroundColor: Colors.darkerBackground,
    borderColor: Colors.darkerBackground
  },
  listItemTitle: {
    paddingLeft: 20,
    color: Colors.primaryText
  },
  rank: {
    paddingRight: 10
  }
})

export default withContext(Settings)