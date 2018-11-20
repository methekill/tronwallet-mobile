import React, { Component } from 'react'
import { FlatList, Image } from 'react-native'

// Design
import * as Utils from '../../components/Utils'
import NavigationHeader from '../../components/Navigation/Header'
import { ExchangeRow, Divider } from './elements'

// Utils
import { withContext } from '../../store/context'
// import tl from '../../utils/i18n'
import { Colors } from '../../components/DesignSystem'
import FontelloIcon from '../../components/FontelloIcon'

// Services
import WalletClient from '../../services/client'
import LoadingScene from '../../components/LoadingScene'

class ExchangeScene extends Component {
    static navigationOptions = { header: null }

    state = {
      exchangeList: [],
      exchangePrices: {},
      loading: true
    }

    componentDidMount () {
      this._navListener = this.props.navigation.addListener('didFocus', this._loadData)
      this._loadData()
    }

    componentWillUnmount () {
      this._navListener.remove()
    }

    _loadData = async () => {
      try {
        let exchangeList = await WalletClient.getExchangesList()
        this.setState({exchangeList, loading: false})
      } catch (error) {
        console.warn('Error Exchange List', error)
      }
    }

    _renderPercentageIndicator = id => {
      const currentPercentage = Math.random() * 200 - 100
      const color = currentPercentage >= 0 ? Colors.weirdGreen : Colors.unconfirmed
      const arrow = currentPercentage >= 0 ? 'transfer-up' : 'transfer-down'
      return <Utils.Row>
        <Utils.Text size='xsmall' color={color}>{currentPercentage.toFixed(2)}%</Utils.Text>
        <Utils.View width={16} />
        <FontelloIcon
          color={color}
          name={arrow}
          size={14}
        />
      </Utils.Row>
    }

    _renderItem = ({item}) =>
      <ExchangeRow onPress={() => this.props.navigation.navigate('ExchangeTransaction', { exData: item })}>
        <Image
          source={require('../../assets/logo-circle.png')}
          style={{width: 50, alignSelf: 'center', height: 50}}
        />
        <Utils.View flex={1} paddingX='small' justify='center'>
          <Utils.Text size='small'>
            {item.firstTokenId} / {item.secondTokenId}
          </Utils.Text>
          <Utils.View height={8} />
          <Utils.Row justify='space-between'>
            <Utils.Text size='xsmall' color={Colors.greyBlue}>
              {item.price.toFixed(8)}
            </Utils.Text>
            {this._renderPercentageIndicator(item.exchangeId)}
          </Utils.Row>
        </Utils.View>
      </ExchangeRow>

    _renderSeparator = () => <Divider />

    render () {
      const { exchangeList, loading } = this.state
      return (
        <Utils.SafeAreaView>
          <NavigationHeader
            title='Exchange'
          />
          {loading
            ? <LoadingScene />
            : <FlatList
              data={exchangeList}
              renderItem={this._renderItem}
              ItemSeparatorComponent={this._renderSeparator}
              keyExtractor={(item) => item.creatorAddress}
            />}
        </Utils.SafeAreaView>
      )
    }
}

export default withContext(ExchangeScene)
