import React, { Component } from 'react'
import { Dimensions } from 'react-native'
import { TabViewAnimated, TabBar } from 'react-native-tab-view'
import find from 'lodash/find'

// Design
import { Colors } from '../../../components/DesignSystem'
import SellScene from './Sell'
import BuyScene from './Buy'
import LockPin from './Lock'
import ActionModal from './ActionModal'
import NavigationHeader from '../../../components/Navigation/Header'
import { SafeAreaView } from '../../../components/Utils'

// Utils
import tl from '../../../utils/i18n'
import { withContext } from '../../../store/context'
import { logSentry } from '../../../utils/sentryUtils'
import Async from '../../../utils/asyncStorageUtils'
import { ASK_PIN_EX } from '../../../utils/constants'

// Service
import TronStreamSocket from '../../../services/socket'
import WalletClient from '../../../services/client'

const initialLayout = {
  height: 0,
  width: Dimensions.get('window').width
}

const SCREENSIZE = Dimensions.get('window')
const TAB_WIDTH = SCREENSIZE.width / 2
const INDICATOR_WIDTH = 13

export class ExchangeTabs extends Component {
  static navigationOptions = {
    header: null
  }

  state = {
    index: 0,
    routes: [
      { key: 'buy', title: tl.t('buy') },
      { key: 'sell', title: tl.t('sell') }
    ],
    exchangeData: this.props.navigation.getParam('exData',
      { exchangeId: -1,
        creatorAddress: '',
        createTime: 0,
        firstTokenId: '',
        firstTokenAbbr: '',
        firstTokenBalance: 0,
        secondTokenId: '',
        secondTokenAbbr: '',
        secondTokenBalance: 0,
        available: false,
        variation: -999,
        price: 0
      }),
    lastTransactions: [],
    refreshingExchange: false,
    askPinEx: true,
    modalVisible: false
  }

  componentDidMount () {
    this._loadAskPin()
    this._setExchangeSocket()
    this._setRefreshLastExchanges()
  }

  componentWillUnmount () {
    this.exchangeSocket.close()
    clearInterval(this.refreshExchangesInterval)
  }

  _toggleLock = () => {
    this.setState({askPinEx: !this.state.askPinEx})
    Async.set(ASK_PIN_EX, `${!this.state.askPinEx}`)
  }

  _loadExchangesTransactions = async () => {
    const { lastTransactions } = this.state
    const { exchangeId } = this.state.exchangeData
    this.setState({refreshingExchange: true})
    try {
      const updatedTransactions = await WalletClient.getTransactionExchangesList(exchangeId)
      if (!lastTransactions.length || updatedTransactions[0]['_id'] !== lastTransactions[0]['_id']) {
        this.setState({lastTransactions: updatedTransactions, refreshingExchange: false})
      } else {
        this.setState({refreshingExchange: false})
      }
    } catch (error) {
      logSentry('Exchange Tabs - Load Transactions', error)
      this.setState({refreshingExchange: false})
    }
  }

  _loadAskPin = async () => {
    const askPinEx = await Async.get(ASK_PIN_EX, 'true')
    this.setState({askPinEx: askPinEx === 'true'})
  }

  _setRefreshLastExchanges = () => {
    // Using Timeout to prevent UI freezing
    setTimeout(() => {
      this._loadExchangesTransactions()
      this.refreshExchangesInterval = setInterval(this._loadExchangesTransactions, 15000)
    }, 1500)
  }

  _setExchangeSocket = () => {
    this.exchangeSocket = TronStreamSocket()

    this.exchangeSocket.on('exchange-list', exchangeList => {
      const { exchangeId, price: oldPrice } = this.state.exchangeData
      const { price: newPrice } = find(exchangeList, {exchangeId}) || { price: null }
      if (newPrice && (oldPrice !== newPrice)) {
        this.setState({exchangeData: {...this.state.exchangeData, price: newPrice}})
      }
    })
  }

  _setModalVisibility = visible => this.setState({modalVisible: visible})

  _handleIndexChange = index => this.setState({ index })

  _renderRightButtonNav = () => (
    <LockPin
      locked={this.state.askPinEx}
      onPress={() => this._setModalVisibility(true)}
    />
  )

  _renderHeader = props => (
    <TabBar
      {...props}
      indicatorStyle={{
        width: INDICATOR_WIDTH,
        height: 1,
        marginLeft: TAB_WIDTH / 2 - INDICATOR_WIDTH / 2
      }}
      tabStyle={{
        padding: 8
      }}
      labelStyle={{
        fontFamily: 'Rubik-Medium',
        fontSize: 12,
        letterSpacing: 0.65,
        lineHeight: 12
      }}
      style={{
        backgroundColor: Colors.background,
        elevation: 0,
        shadowOpacity: 0
      }}
    />
  )

  _renderScene = ({ route }) => {
    switch (route.key) {
      case 'sell':
        return (
          <SellScene {...this.props} {...this.state} />)
      case 'buy':
        return (
          <BuyScene {...this.props} {...this.state} />)
      default:
        return null
    }
  }

  render () {
    return (
      <SafeAreaView>
        <NavigationHeader
          title={tl.t('ex')}
          onBack={() => this.props.navigation.goBack()}
          rightButton={this._renderRightButtonNav()}
        />
        <TabViewAnimated
          navigationState={this.state}
          renderScene={this._renderScene}
          renderHeader={this._renderHeader}
          onIndexChange={this._handleIndexChange}
          initialLayout={initialLayout}
        />
        <ActionModal
          isVisible={this.state.modalVisible}
          locked={this.state.askPinEx}
          onClose={() => this._setModalVisibility(false)}
          toggleLock={this._toggleLock}
        />
      </SafeAreaView>
    )
  }
}
export default withContext(ExchangeTabs)
