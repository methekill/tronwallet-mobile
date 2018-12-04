import React, { Component } from 'react'
import { Dimensions } from 'react-native'
import { TabViewAnimated, TabBar } from 'react-native-tab-view'
import find from 'lodash/find'

// Design
import { Colors } from '../../../components/DesignSystem'
import SellScene from '../Sell'
import BuyScene from '../Buy'
import NavigationHeader from '../../../components/Navigation/Header'
import { SafeAreaView } from '../../../components/Utils'

// Utils
import tl from '../../../utils/i18n'

// Service
import TronStreamSocket from '../../../services/socket'

const initialLayout = {
  height: 0,
  width: Dimensions.get('window').width
}

const SCREENSIZE = Dimensions.get('window')
const TAB_WIDTH = SCREENSIZE.width / 2
const INDICATOR_WIDTH = 13

export default class TransferScene extends Component {
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
        firstTokenBalance: 0,
        secondTokenId: '',
        secondTokenBalance: 0,
        available: false,
        price: 0
      }),
    refreshingPrice: false
  }

  componentDidMount () {
    this._setExchangeSocket()
  }

  componentWillUnmount () {
    this.exchangeSocket.close()
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

  _handleIndexChange = index => this.setState({ index })

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
        return (<SellScene {...this.props} exchangeData={this.state.exchangeData} />)
      case 'buy':
        return (<BuyScene {...this.props} exchangeData={this.state.exchangeData} />)
      default:
        return null
    }
  }

  render () {
    return (
      <SafeAreaView>
        <React.Fragment>
          <NavigationHeader
            title='EXCHANGE'
            onBack={() => this.props.navigation.goBack()}
          />
          <TabViewAnimated
            navigationState={this.state}
            renderScene={this._renderScene}
            renderHeader={this._renderHeader}
            onIndexChange={this._handleIndexChange}
            initialLayout={initialLayout}
          />
        </React.Fragment>
      </SafeAreaView>
    )
  }
}
