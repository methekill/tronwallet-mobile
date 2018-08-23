import React, { Component } from 'react'
import {
  RefreshControl,
  ScrollView,
  AsyncStorage,
  TouchableOpacity
} from 'react-native'
import { Answers } from 'react-native-fabric'
import Feather from 'react-native-vector-icons/Feather'

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

class BalanceScene extends Component {
  static navigationOptions = {
    header: null
  }

  state = {
    activeAccount: 0,
    refreshing: false,
    creatingNewAccount: false,
    error: null,
    balances: [],
    currency: null
  }

  componentDidMount () {
    Answers.logContentView('Tab', 'Balance')
    try {
      this._loadData()
    } catch (e) {
      this.setState({ error: tl.t('balance.error.loadingData') })
    }

    this._navListener =
      this.props.navigation.addListener('didFocus', this._loadData)

    // Update assets when you enter the wallet
    updateAssets()
  }

  componentWillUnmount () {
    this._navListener.remove()
    clearInterval(this._dataListener)
  }

  _addNewAccount = async () => {
    this.setState({ creatingNewAccount: true })
    await createNewAccount(this.props.context.pin, this.props.context.oneSignalId)
    await this.props.context.loadUserData()
    this.setState({ creatingNewAccount: false })
  }

  _onRefresh = async () => {
    this.setState({ refreshing: true })
    await this._loadData()
    this.setState({ refreshing: false })
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
      throw e
    }
  }

  _onSnapToItem = activeAccount => {
    const { setPublicKey, accounts } = this.props.context
    if (accounts.length) {
      const { address } = accounts[activeAccount]
      setPublicKey(address)
      this.setState({ activeAccount })
    }
  }

  render () {
    const {
      seed,
      creatingNewAccount,
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
          rightButton={(
            <TouchableOpacity onPress={this._addNewAccount} disabled={creatingNewAccount}>
              <Feather name='plus' color={creatingNewAccount ? 'grey' : 'white'} size={28} />
            </TouchableOpacity>
          )}
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
            <AccountsCarousel onSnapToItem={this._onSnapToItem} />
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
