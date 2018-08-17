import React, { Component } from 'react'
import { FlatList, AsyncStorage } from 'react-native'
import { Answers } from 'react-native-fabric'

import tl from '../../utils/i18n'
import Transaction from './Transaction'
import { Background } from './elements'
import NavigationHeader from '../../components/Navigation/Header'
import SyncButton from '../../components/SyncButton'
import { USER_FILTERED_TOKENS } from '../../utils/constants'

import getAssetsStore from '../../store/assets'
import getTransactionStore from '../../store/transactions'
import { withContext } from '../../store/context'
import { updateTransactions } from '../../utils/transactionUtils'

import Empty from './Empty'
import { ONE_TRX } from '../../services/client'

class TransactionsScene extends Component {
  static navigationOptions = ({ navigation }) => {
    const { params } = navigation.state

    return {
      header: (<NavigationHeader
        title={tl.t('transactions.title')}
        leftButton={<SyncButton
          loading={params && params.refreshing}
          onPress={() => params.updateData()}
        />}
      />)
    }
  }

  state = {
    refreshing: true,
    transactions: []
  }

  async componentDidMount () {
    Answers.logContentView('Tab', 'Transactions')
    this.props.navigation.setParams({
      refreshing: true,
      updateData: this._onRefresh
    })

    await this._updateData()
    this._onRefresh()
    this._didFocusSubscription = this.props.navigation.addListener('didFocus', this._onRefresh)
  }

  componentWillUnmount () {
    this.didFocusSubscription.remove()
  }

  _getSortedTransactionList = store =>
    store
      .objects('Transaction')
      .sorted([['timestamp', true]])
      .map(item => Object.assign({}, item))

  _onRefresh = async () => {
    this._setRefreshState(true)
    await updateTransactions(this.props.context.pin)
    await this._updateData()
    this._setRefreshState(false)
  }

  _setRefreshState = (state) => {
    this.setState({ refreshing: state })
    this.props.navigation.setParams({ refreshing: state })
  }

  _updateData = async () => {
    try {
      const transactionStore = await getTransactionStore()
      const transactions = this._getSortedTransactionList(transactionStore)

      const userTokens = await AsyncStorage.getItem(USER_FILTERED_TOKENS)
      const filteredTransactions = transactions.filter(({ type, contractData }) =>
        contractData.tokenName === null ||
        JSON.parse(userTokens).findIndex(name => name === contractData.tokenName) !== -1
      )

      const assetStore = await getAssetsStore()
      const updatedTransactions = this._updateParticipateTransactions(filteredTransactions, assetStore)

      this.setState({ transactions: updatedTransactions })
    } catch (err) {
      console.error(err)
      this._setRefreshState(false)
    }
  }

  _updateParticipateTransactions = (transactions, assetStore) => (
    transactions.map((transaction) => {
      if (transaction.type === 'Participate') {
        const tokenPrice = this._getTokenPriceFromStore(transaction.contractData.tokenName, assetStore)
        return { ...transaction, tokenPrice }
      } else {
        return transaction
      }
    })
  )

  _getTokenPriceFromStore = (tokenName, assetStore) => {
    const filtered = assetStore
      .objects('Asset')
      .filtered(
        `name == '${tokenName}'`
      )
      .map(item => Object.assign({}, item))

    if (filtered.length) {
      return filtered[0].price
    }

    return ONE_TRX
  }

  _navigateToDetails = (item) => {
    this.props.navigation.navigate('TransactionDetails', { item })
  }

  render () {
    const { transactions, refreshing } = this.state
    const publicKey = this.props.context.publicKey

    return (
      !transactions.length ? <Empty loading={refreshing} />
        : (
          <Background>
            <FlatList
              data={transactions}
              keyExtractor={item => item.id}
              renderItem={({ item }) => <Transaction item={item} onPress={() => this._navigateToDetails(item)} publicKey={publicKey.value} />}
            />
          </Background>
        )
    )
  }
}

export default withContext(TransactionsScene)
