import React, { Component } from 'react'
import { FlatList, AsyncStorage, Platform, TouchableOpacity } from 'react-native'
import { Answers } from 'react-native-fabric'

import tl from '../../utils/i18n'
import Transaction from './Transaction'
import { Background, InnerRow, FilterText, FilterWrapper } from './elements'
import NavigationHeader from '../../components/Navigation/Header'
import SyncButton from '../../components/SyncButton'
import { USER_FILTERED_TOKENS } from '../../utils/constants'

import getAssetsStore from '../../store/assets'
import getTransactionStore from '../../store/transactions'
import { withContext } from '../../store/context'
import { updateTransactions, getTokenPriceFromStore } from '../../utils/transactionUtils'
import { logSentry } from '../../utils/sentryUtils'
import { Colors } from '../../components/DesignSystem'
import Empty from './Empty'
import FontelloIcon from '../../components/FontelloIcon'

class TransactionsScene extends Component {
  static navigationOptions = () => ({header: null})

  state = {
    refreshing: true,
    transactions: [],
    contact: {
      address: '',
      alias: '',
      name: ''
    }
  }

  async componentDidMount () {
    Answers.logContentView('Tab', 'Transactions')
    this._didFocusSubscription = this.props.navigation.addListener('didFocus', this._onRefresh)
  }

  componentWillUnmount () {
    this._didFocusSubscription.remove()
  }

  _getTransactionByAddress = () => this.state.transactions
    .filter(item => item.ownerAddress === this.props.context.publicKey)

  _getSortedTransactionList = store =>
    store
      .objects('Transaction')
      .sorted([['timestamp', true]])
      .map(item => Object.assign({}, item))

  _getDataFromStore = async () => {
    const transactionStore = await getTransactionStore()
    const transactions = this._getSortedTransactionList(transactionStore)

    const userTokens = await AsyncStorage.getItem(USER_FILTERED_TOKENS)
    const filteredTransactions = transactions.filter(({ type, contractData }) =>
      contractData.tokenName === null ||
            JSON.parse(userTokens).findIndex(name => name === contractData.tokenName) === -1
    )

    const assetStore = await getAssetsStore()
    return this._updateParticipateTransactions(filteredTransactions, assetStore)
  }
  _onRefresh = async () => {
    this.setState({ refreshing: true })
    try {
      const contact = this.props.navigation.getParam('contact', null)
      if (contact) await this._setFilteredContact(contact)
      else await this._updateData()
    } catch (error) {
      logSentry(error, 'On Refresh - Transactions')
    } finally {
      this.setState({ refreshing: false })
    }
  }

  _setFilteredContact = async contact => {
    const transactionsStore = await getTransactionStore()
    const transactionsFiltered = transactionsStore.objects('Transaction')
      .filtered('contractData.transferFromAddress = $0 OR contractData.transferToAddress = $0', contact.address)
      .sorted([['timestamp', true]])
      .map(item => Object.assign({}, item))
    this.setState({transactions: transactionsFiltered, contact})
  }

  _removeFilteredContact = async () => {
    this.setState({refreshing: true, contact: { address: '', alias: '', name: '' }})
    this.props.navigation.setParams({contact: null})
    try {
      const updatedTransactions = await this._getDataFromStore()
      this.setState({ transactions: updatedTransactions })
    } catch (error) {
      logSentry(error, 'Remove filterd contact')
    } finally {
      this.setState({refreshing: false})
    }
  }
  _updateData = async () => {
    try {
      await updateTransactions(this.props.context.publicKey)
      const updatedTransactions = await this._getDataFromStore()
      this.setState({ transactions: updatedTransactions })
    } catch (err) {
      logSentry(err, 'Transactions - load data')
    } finally {
      this.setState({refreshing: false, contact: {address: '', alias: '', name: ''}})
    }
  }

  _updateParticipateTransactions = (transactions, assetStore) => (
    transactions.map((transaction) => {
      if (transaction.type === 'Participate') {
        const tokenPrice = getTokenPriceFromStore(transaction.contractData.tokenName, assetStore)
        return { ...transaction, tokenPrice }
      } else {
        return transaction
      }
    })
  )

  _navigateToDetails = (item) => {
    this.props.navigation.navigate('TransactionDetails', { item })
  }
  _renderFilter = () => {
    if (this.state.contact.address) {
      return <FilterWrapper>
        <InnerRow>
          <FontelloIcon
            name='notebook'
            size={22}
            color={Colors.primaryGradient[0]}
          />
          <FilterText marginX={12} dark>{tl.t('filter')}:</FilterText>
          <FilterText numberOfLines={1}>{this.state.contact.name}</FilterText>
        </InnerRow>
        <InnerRow>
          <TouchableOpacity onPress={this._removeFilteredContact}>
            <FontelloIcon
              name='close'
              color='white'
              size={18}
            />
          </TouchableOpacity>
        </InnerRow>
      </FilterWrapper>
    } else {
      return null
    }
  }
  render () {
    const { refreshing } = this.state
    const { publicKey } = this.props.context
    const transactions = this._getTransactionByAddress()

    return (
      <Background>
        <NavigationHeader
          title={tl.t('transactions.title')}
          leftButton={<SyncButton
            loading={refreshing}
            onPress={this._onRefresh}
          />}
        />
        <FlatList
          data={transactions}
          ListEmptyComponent={<Empty loading={refreshing} />}
          ListHeaderComponent={this._renderFilter}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <Transaction item={item} onPress={() => this._navigateToDetails(item)} publicKey={publicKey} />}
          initialNumToRender={10}
          onEndReachedThreshold={0.75}
          removeClippedSubviews={Platform.OS === 'android'}
        />
      </Background>
    )
  }
}

export default withContext(TransactionsScene)
