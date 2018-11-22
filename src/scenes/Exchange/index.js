import React, { Component } from 'react'
import { FlatList } from 'react-native'

// Design
import * as Utils from '../../components/Utils'
import NavigationHeader from '../../components/Navigation/Header'
import ExchangeItem from './ExchangeItem'
import { Divider } from './elements'

// Utils
import { withContext } from '../../store/context'
import tl from '../../utils/i18n'

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

    _renderItem = ({item}) => <ExchangeItem exchangeData={item} />

    _renderSeparator = () => <Divider />

    render () {
      const { exchangeList, loading } = this.state
      return (
        <Utils.SafeAreaView>
          <NavigationHeader title={tl.t('ex')} />
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
