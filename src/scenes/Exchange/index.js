import React, { Component } from 'react'
import { FlatList, RefreshControl } from 'react-native'
import MixPanel from 'react-native-mixpanel'
import sortBy from 'lodash/sortBy'

// Design
import * as Utils from '../../components/Utils'
import NavigationHeader from '../../components/Navigation/Header'
import ExchangeItem from './Item'
import { Divider, EmptyList } from './elements'
import LoadingScene from '../../components/LoadingScene'

// Utils
import { withContext } from '../../store/context'
import tl from '../../utils/i18n'
import { logSentry } from '../../utils/sentryUtils'
import Async from '../../utils/asyncStorageUtils'
import { FAVORITE_EXCHANGES } from '../../utils/constants'
import { formatNumber } from '../../utils/numberUtils'

// Services
import WalletClient from '../../services/client'

export class ExchangeScene extends Component {
    static navigationOptions = { header: null }

    state = {
      exchangeList: [],
      loading: true,
      refreshing: false,
      isSearching: false,
      searchName: '',
      currentList: [],
      favoriteExchanges: []
    }

    componentDidMount () {
      this._loadData()
      this._didFocusSubscription = this.props.navigation.addListener('didFocus', this._loadData)
    }

    componentWillUnmount () {
      this._didFocusSubscription.remove()
    }

    _loadData = async () => {
      try {
        const [exchangeList, favoriteList] = await Promise.all([WalletClient.getExchangesList(), Async.get(FAVORITE_EXCHANGES, '[]')])
        const parsedFavoriteList = JSON.parse(favoriteList)
        const sortedExList = this._sortExList(exchangeList, parsedFavoriteList)

        this.setState({
          exchangeList: sortedExList,
          currentList: sortedExList,
          loading: false,
          favoriteExchanges: parsedFavoriteList
        })
      } catch (error) {
        logSentry(error, 'Error exchange list')
        this.setState({exchangeList: [], loading: false})
      }
    }

    _getBalanceByName = tokenName => {
      const { balances, publicKey } = this.props.context
      if (balances[publicKey]) {
        const { balance } = balances[publicKey].find(bl => bl.name === tokenName) || { balance: 0 }
        return formatNumber(balance)
      }
      return formatNumber(0, true)
    }

    _sortExList = (list, favList) => (
      sortBy(
        list.map(ex => ({...ex, favorited: favList.indexOf(ex.exchangeId) > -1, firstTokenUserBalance: this._getBalanceByName(ex.firstTokenId)})),
        [(ex) => !ex.favorited, (ex) => ex.firstTokenId !== 'TWX', (ex) => -(ex.variation || -999)]
      )
    )

    _onFavoritePress = async newExId => {
      const { exchangeList, currentList, favoriteExchanges } = this.state
      try {
        // Find if Exchange ID is already saved
        let newFavoriteExchanges = favoriteExchanges.slice()
        const exIdPosition = newFavoriteExchanges.indexOf(newExId)

        // Change the exchange list to update the favorite status
        let newExList = exchangeList.slice()
        let newCurrList = currentList.slice()

        exIdPosition > -1 ? newFavoriteExchanges.splice(exIdPosition, 1) : newFavoriteExchanges.push(newExId)

        // Sort the exchange to put the favorite ones up to the top
        newExList = this._sortExList(newExList, newFavoriteExchanges)
        newCurrList = this._sortExList(newCurrList, newFavoriteExchanges)

        this.setState({
          exchangeList: newExList,
          currentList: newCurrList,
          favoriteExchanges: newFavoriteExchanges
        })
        await Async.set(FAVORITE_EXCHANGES, JSON.stringify(newFavoriteExchanges))
      } catch (error) {
        logSentry('Exchange Favorite Press', error)
      }
    }

    _onSearching = name => {
      const { exchangeList } = this.state
      const searchValue = name.toString().replace(/^[^a-zA-Z]/g, '')
      const regex = new RegExp(searchValue.toUpperCase(), 'i')
      const resultList = exchangeList.filter(ast => regex.test(ast.firstTokenId.toUpperCase()) ||
        regex.test(ast.secondTokenId.toUpperCase()))

      this.setState({ searchName: name }, () => {
        MixPanel.trackWithProperties('Exchange', { type: 'Searching Exchange', name })
        const searchedList = name ? resultList : []
        this.setState({ currentList: searchedList })
      })
    }

    _onSearchPressed = () => {
      const { isSearching, exchangeList } = this.state
      let currentList = []
      if (isSearching) {
        currentList = exchangeList
      } else {
        currentList = []
      }
      this.setState({isSearching: !isSearching, currentList})
    }

    _onItemPressed = item => {
      const { exchangeList } = this.state
      const { navigation } = this.props

      navigation.navigate('ExchangeTabs', { exData: item })
      this.setState({ isSearching: false, currentList: exchangeList, searchName: '' })

      MixPanel.trackWithProperties('Exchange', {
        type: 'Entering Exchange',
        name: `${item.firstTokenId}/${item.secondTokenId}`
      })
    }

    _onRefreshing = async () => {
      this.setState({refreshing: true, isSearching: false, searchName: ''})
      await this._loadData()
      this.setState({refreshing: false})
    }

    _renderItem = ({item}) => (
      <ExchangeItem
        exchangeData={item}
        onItemPress={this._onItemPressed}
        onFavoritePress={this._onFavoritePress}
      />
    )

    _renderEmptyList = () => (
      this.state.isSearching && !this.state.searchName
        ? <Utils.View />
        : <EmptyList text={tl.t('exchange.notFound')} />
    )

    _renderSeparator = () => (<Divider />)

    render () {
      const { loading, currentList, isSearching, refreshing } = this.state
      return (
        <Utils.SafeAreaView>
          <NavigationHeader
            title={tl.t('ex')}
            isSearching={isSearching}
            onSearch={name => this._onSearching(name)}
            onSearchPressed={() => this._onSearchPressed()}
            searchPreview={tl.t('exchange.preview')}
          />
          {loading
            ? <LoadingScene />
            : <FlatList
              data={currentList}
              renderItem={this._renderItem}
              ListEmptyComponent={this._renderEmptyList}
              ItemSeparatorComponent={this._renderSeparator}
              keyExtractor={(item) => item.exchangeId.toString()}
              initialNumToRender={10}
              onEndReachedThreshold={0.75}
              refreshControl={<RefreshControl
                refreshing={refreshing}
                onRefresh={this._onRefreshing}
              />}
            />}
        </Utils.SafeAreaView>
      )
    }
}
export default withContext(ExchangeScene)
