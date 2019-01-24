// Dependencies
import React, { Component } from 'react'
import { Linking, FlatList, Alert, View, Platform, RefreshControl, Image } from 'react-native'
import { Answers } from 'react-native-fabric'
import MixPanel from 'react-native-mixpanel'
import forIn from 'lodash/forIn'
import reduce from 'lodash/reduce'
import union from 'lodash/union'
import clamp from 'lodash/clamp'
import debounce from 'lodash/debounce'

// Utils
import tl from '../../utils/i18n'
import { TronVaultURL } from '../../utils/deeplinkUtils'
import { formatNumber } from '../../utils/numberUtils'

// Components
import * as Utils from '../../components/Utils'
import Header from '../../components/Header'
import VoteItem from '../../components/Vote/list/Item'
import AddVotesModal from '../../components/Vote/AddModal'
import ConfirmModal from '../../components/Vote/ConfirmModal'
import FadeIn from '../../components/Animations/FadeIn'
import GrowIn from '../../components/Animations/GrowIn'
import ConfirmVotes from '../../components/Vote/ConfirmButton'
import NavigationHeader from '../../components/Navigation/Header'
import ClearButton from '../../components/ClearButton'

// Service
import WalletClient from '../../services/client'
import { signTransaction } from '../../utils/transactionUtils'

import getCandidateStore from '../../store/candidates'
import { withContext } from '../../store/context'
import getTransactionStore from '../../store/transactions'
import { logSentry } from '../../utils/sentryUtils'

const AMOUNT_TO_FETCH = 200

const INITIAL_STATE = {
  // Numbers of Interest
  totalVotes: 0,
  totalRemaining: 0,
  totalUserVotes: 0,
  amountToVote: 0,
  totalFrozen: 0,
  // Vote Lists
  voteList: [],
  currentVotes: {},
  currentFullVotes: [],
  userVotes: {},
  // Items
  currentVoteItem: {},
  // Loading
  loadingList: true,
  refreshing: false,
  loadingMore: false,
  // Search
  isSearching: false,
  searchName: '',
  // Flags
  offset: 0,
  modalVisible: false,
  confirmModalVisible: false,
  startedVoting: false
}

class VoteScene extends Component {
  constructor () {
    super()
    this.state = INITIAL_STATE

    this.resetAddModal = {
      currentVoteItem: {},
      amountToVote: 0,
      modalVisible: false
    }
    this.resetVoteData = {
      offset: 0,
      amountToVote: 0,
      currentVoteItem: {},
      startedVoting: false,
      isSearching: false,
      userVotes: {}
    }
  }

  componentDidMount () {
    Answers.logContentView('Tab', 'Votes')
    this._onSearching = debounce(this._onSearching, 150)

    this._loadCandidates()
    this.didFocusSubscription = this.props.navigation.addListener('didFocus', this._loadData)
  }

  componentWillUnmount () {
    this.didFocusSubscription.remove()
  }

  _getVoteListFromStore = (start = this.state.offset) => {
    const maxLength = this.candidateStoreRef.objects('Candidate').length
    const from = start > maxLength ? start - AMOUNT_TO_FETCH : start
    const to = clamp(start + AMOUNT_TO_FETCH, maxLength)

    const updatedCandidate = this.candidateStoreRef
      .objects('Candidate')
      .sorted([['votes', true], ['rank', false]])
      .slice(from, to)
      .map(item => Object.assign({}, item))

    this.setState({ offset: to })
    return updatedCandidate
  }

  _getLastUserVotesFromStore = () => {
    const { context } = this.props

    const queryVoteUnfreeze = this.transactionsStoreRef
      .objects('Transaction')
      .sorted([['timestamp', true]])
      .filtered(
        'ownerAddress = $0 AND (type == "Vote" OR type == "Unfreeze")',
        context.publicKey
      )

    // If there was an Unfreeze transaction after voting, delete previously votes
    const lastVoteTransaction =
      queryVoteUnfreeze.length && queryVoteUnfreeze[0].type === 'Vote'
        ? queryVoteUnfreeze[0]
        : null

    if (lastVoteTransaction) {
      let lastVote = [...lastVoteTransaction.contractData.votes]
      let renormalize = {}
      for (let vote of lastVote) {
        renormalize[vote.voteAddress] = vote.voteCount
      }
      return renormalize
    }
    // No votes for this account yet
    return {}
  }

  _loadData = async () => {
    this.setState(this.resetVoteData, async () => {
      await this._refreshCandidates()
      await this._loadUserData()
    })
  }

  _loadCandidates = async () => {
    try {
      this.candidateStoreRef = await getCandidateStore()
      this.transactionsStoreRef = await getTransactionStore()
      this._loadData()
      MixPanel.track('Load Votes')
    } catch (e) {
      logSentry(e, 'Load Candidates Error')
    }
  }

  _refreshCandidates = async (refreshControl = true) => {
    if (refreshControl) this.setState({ refreshing: true })
    try {
      const { voteList, totalVotes } = await WalletClient.getWitnessesList()
      this.candidateStoreRef.write(() => voteList.map(item => this.candidateStoreRef.create('Candidate', item, true)))
      this.setState({ totalVotes, voteList: voteList.slice(0, AMOUNT_TO_FETCH) })
    } catch (e) {
      logSentry(e, 'Refresh Candidates Error')
    } finally {
      this.setState({ refreshing: false })
    }
  }

  _loadMoreCandidates = async () => {
    if (this.state.isSearching) return
    this.setState({ loadingMore: true })
    try {
      const voteList = await this._getVoteListFromStore(
        this.state.offset + AMOUNT_TO_FETCH
      )
      this.setState({
        voteList: union(this.state.voteList, voteList),
        loadingMore: false
      })
    } catch (e) {
      logSentry(e, 'Load More Candidates Error')
      this.setState({ loadingMore: false })
    }
  }

  _loadUserData = async () => {
    const { freeze, publicKey } = this.props.context
    try {
      let totalFrozen = freeze[publicKey] ? freeze[publicKey].total : 0

      let userVotes = this._getLastUserVotesFromStore()
      if (userVotes) {
        const currentUserVoteCount = this._getVoteCountFromList(userVotes)
        const newFullVoteList = this._getUserFullVotedList(userVotes)
        const newTotalRemaining = totalFrozen - currentUserVoteCount >= 0
          ? totalFrozen - currentUserVoteCount : 0

        this.setState({
          currentVotes: userVotes,
          totalUserVotes: currentUserVoteCount,
          totalRemaining: newTotalRemaining,
          currentFullVotes: newFullVoteList,
          totalFrozen
        })
      } else {
        this.setState({
          totalRemaining: totalFrozen,
          totalFrozen
        })
      }
    } catch (e) {
      logSentry(e, 'Votes - Freeze Error')
    } finally {
      this.setState({
        loadingList: false
      })
    }
  }

  _submit = async () => {
    const { currentVotes, totalRemaining } = this.state
    const { navigation } = this.props

    if (totalRemaining >= 0) {
      this.setState({ loadingList: true })
      navigation.setParams({ disabled: true })

      forIn(currentVotes, function (value, key) {
        currentVotes[key] = Number(value)
      })
      try {
        const data = await WalletClient.getVoteWitnessTransaction(this.props.context.publicKey, currentVotes)
        this._openTransactionDetails(data)
      } catch (error) {
        Alert.alert(tl.t('error.buildingTransaction'))
        this.setState({ loadingList: false })
        logSentry(error, 'Vote - submit')
        navigation.setParams({ disabled: false })
      }
    }
  }

  _openTransactionDetails = async transactionUnsigned => {
    try {
      const { accounts, publicKey } = this.props.context
      const privateKey = accounts.find(item => item.address === publicKey).privateKey
      const transactionSigned = await signTransaction(privateKey, transactionUnsigned)
      this.setState(
        { ...this.resetAddModal, loadingList: false, refreshing: false },
        () => {
          this.props.navigation.navigate('SubmitTransaction', {
            tx: transactionSigned
          })
        }
      )
    } catch (error) {
      this.setState({
        error: tl.t('error.gettingTransaction'),
        loadingList: false,
        refreshing: false
      })
      logSentry(error, 'Vote - open tx')
    }
  }

  _openDeepLink = async dataToSend => {
    try {
      const url = `${TronVaultURL}auth/${dataToSend}`

      await Linking.openURL(url)

      this.setState({ loading: false })
    } catch (error) {
      this.setState({ loading: false }, () => {
        this.props.navigation.navigate('GetVault')
      })
      logSentry(error, 'Vote - open deeplink')
    }
  }

  _onChangeVotes = async value => {
    const { currentVotes, currentVoteItem } = this.state
    const { freeze, publicKey } = this.props.context
    const totalFrozen = freeze[publicKey] ? freeze[publicKey].total : 0
    const newVotes = { ...currentVotes, [currentVoteItem.address]: value }

    const totalUserVotes = this._getVoteCountFromList(newVotes)
    const totalVotesRemaining = totalFrozen - totalUserVotes > 0 ? totalFrozen - totalUserVotes : 0

    const currentFullVotes = this._getUserFullVotedList(newVotes)

    this.setState({
      currentVotes: newVotes,
      currentFullVotes,
      totalRemaining: totalVotesRemaining,
      totalUserVotes,
      ...this.resetAddModal
    })
  }

  _setupVoteModal = item => {
    this.setState({
      modalVisible: true,
      currentVoteItem: item
    })
  }

  _openConfirmModal = () => this.setState({ confirmModalVisible: true })

  _closeModal = () => this.setState({ ...this.resetAddModal })

  _closeConfirmModal = () => this.setState({ confirmModalVisible: false })

  _getUserFullVotedList = (currentVotes) => {
    // Full Votes means users selected candidates with details, not the complete vote list
    const fullList = this.candidateStoreRef.objects('Candidate').map(item => Object.assign({}, item))

    const userVotedList = []
    for (const voteAddress in currentVotes) {
      const voteCounted = fullList.find(v => v.address === voteAddress)
      voteCounted.voteCount = currentVotes[voteAddress]
      userVotedList.push(voteCounted)
    }

    return userVotedList.sort((a, b) => a.voteCount > b.voteCount ? -1 : a.voteCount < b.voteCount ? 1 : 0)
  }

  _getVoteCountFromList = list =>
    list
      ? reduce(list, (result, value) => Number(result) + Number(value), 0)
      : 0

  _addToVote = num => {
    const { amountToVote } = this.state
    this.setState({ amountToVote: amountToVote + num })
  }

  _acceptCurrentVote = amountToVote => {
    const { isSearching } = this.state
    this.setState({ startedVoting: true })
    amountToVote <= 0
      ? this._removeVoteFromList()
      : this._onChangeVotes(amountToVote)
    if (isSearching) this._onSearchPressed()
  }

  _removeVoteFromList = async (address = null) => {
    const { currentVotes, currentVoteItem } = this.state
    const { freeze, publicKey } = this.props.context
    const totalFrozen = freeze[publicKey] ? freeze[publicKey].total : 0

    const voteToRemove = address || currentVoteItem.address
    delete currentVotes[voteToRemove]

    const newTotalVoteCount = this._getVoteCountFromList(currentVotes)
    const newCurrentFullVotes = this._getUserFullVotedList(currentVotes)

    const newRemaining =
      totalFrozen - newTotalVoteCount > 0 ? totalFrozen - newTotalVoteCount : 0

    this.setState({
      currentVotes,
      currentFullVotes: newCurrentFullVotes,
      totalRemaining: newRemaining,
      totalUserVotes: newTotalVoteCount,
      ...this.resetAddModal
    })
  }

  _clearVotesFromList = () => {
    const { totalFrozen } = this.state
    this.setState({
      currentVotes: [],
      currentFullVotes: [],
      totalRemaining: totalFrozen,
      totalUserVotes: 0,
      ...this.resetAddModal
    })
  }

  _onSearchPressed = () => {
    const { isSearching, loadingList } = this.state

    if (loadingList) return

    this.setState({ isSearching: !isSearching, searchName: '' })
    if (isSearching) {
      const candidates = this.candidateStoreRef
        .objects('Candidate')
        .sorted([['votes', true], ['rank', false]])
        .map(item => Object.assign({}, item))

      this.setState({
        voteList: candidates.slice(0, AMOUNT_TO_FETCH),
        offset: 0
      })
    } else {
      this.setState({ voteList: this._filteredSuggestions(), offset: 0 })
    }
  }

  _onSearching = async name => {
    let searchedList = []
    if (name) {
      searchedList = this.candidateStoreRef
        .objects('Candidate')
        .filtered('name CONTAINS[c] $0', name)
        .map(item => Object.assign({}, item))
    } else {
      searchedList = this._filteredSuggestions()
    }
    this.setState({
      searchName: name,
      voteList: searchedList,
      loadingList: false
    })
  }

  _filteredSuggestions = () => {
    const candidateTronWallet = this.candidateStoreRef.objects('Candidate').filtered("name = 'TronWalletMe'")[0]
    const mostVoted = this.state.currentFullVotes.filter(candidate => candidate.name !== 'TronWalletMe')
    return [candidateTronWallet, ...mostVoted]
  }

  _renderRow = ({ item, index }) => {
    const { currentVotes, userVotes, refreshing, loadingList } = this.state
    return (
      <VoteItem
        disabled={refreshing || loadingList}
        item={item}
        index={index}
        openModal={() => this._setupVoteModal(item)}
        voteCount={currentVotes[item.address]}
        userVote={userVotes[item.address]}
      />
    )
  }

  _renderListHedear = () => {
    const { totalVotes, totalRemaining, isSearching } = this.state
    if (!isSearching) {
      return (
        <React.Fragment>
          <GrowIn name='vote-header' height={63}>
            <Header>
              <Utils.View align='center'>
                <Utils.Text size='tiny' weight='500' secondary>
                  {tl.t('votes.totalVotes')}
                </Utils.Text>
                <Utils.VerticalSpacer />
                <Utils.Text size='small'>{formatNumber(totalVotes)}</Utils.Text>
              </Utils.View>
              <Utils.View align='center'>
                <Utils.Text size='tiny' weight='500' secondary>
                  {tl.t('votes.votesAvailable')}
                </Utils.Text>
                <Utils.VerticalSpacer />
                <Utils.Text
                  size='small'
                  style={{
                    color: `${totalRemaining < 0 ? '#dc3545' : '#fff'}`
                  }}
                >
                  {formatNumber(totalRemaining)}
                </Utils.Text>
              </Utils.View>
            </Header>
          </GrowIn>
          <Utils.VerticalSpacer size='large' />
        </React.Fragment>
      )
    } else {
      return null
    }
  }

  _renderEmptyList = () => {
    const isLoading = (this.state.loadingList || this.state.refreshing) && !this.state.voteList.length
    return <Utils.View flex={1} align='center' justify='center' padding={20}>
      {isLoading
        ? <Image
          source={require('../../assets/votes.png')}
          resizeMode='contain'
          style={{ width: 200, height: 200 }} />
        : <React.Fragment>
          <Image
            source={require('../../assets/empty.png')}
            resizeMode='contain'
            style={{ width: 200, height: 200 }} />
          <Utils.Text size='tiny'>{tl.t('votes.notFound')}</Utils.Text>
        </React.Fragment>}
    </Utils.View>
  }

  _renderLeftElement = () => {
    if (this.state.currentFullVotes.length) {
      return (
        <ClearButton
          disabled={this.state.refreshing || this.state.loadingList}
          onPress={this._clearVotesFromList}
          padding={10}
        />
      )
    }
    return (<View />)
  }

  render () {
    const {
      refreshing,
      loadingList,
      currentVotes,
      totalUserVotes,
      confirmModalVisible,
      currentFullVotes,
      voteList,
      currentVoteItem,
      startedVoting,
      isSearching,
      searchName,
      totalFrozen
    } = this.state
    const searchPreview = searchName ? `${tl.t('results')}: ${voteList.length}` : tl.t('votes.searchPreview')
    return (
      <Utils.SafeAreaView>
        <Utils.Container>
          <NavigationHeader
            title={tl.t('votes.title')}
            isSearching={isSearching}
            leftButton={this._renderLeftElement()}
            onSearch={name => this._onSearching(name)}
            onSearchPressed={() => this._onSearchPressed()}
            searchPreview={searchPreview}
          />
          <Utils.View flex={1}>
            <FadeIn name='candidates'>
              <FlatList
                ListHeaderComponent={this._renderListHedear}
                ListEmptyComponent={this._renderEmptyList}
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={this._refreshCandidates}
                  />
                }
                keyExtractor={item => item.address + item.url}
                extraData={[totalUserVotes, currentFullVotes]}
                data={voteList}
                renderItem={this._renderRow}
                refreshing={refreshing || loadingList}
                onEndReached={this._loadMoreCandidates}
                maxToRenderPerBatch={AMOUNT_TO_FETCH}
                onEndReachedThreshold={0.5}
                removeClippedSubviews={Platform.OS === 'android'}
              />
            </FadeIn>
          </Utils.View>
          {totalUserVotes > 0 &&
            startedVoting &&
            !isSearching && (
              <ConfirmVotes
                onPress={this._openConfirmModal}
                voteCount={currentFullVotes.length}
              />
            )}
          {this.state.modalVisible && (
            <AddVotesModal
              acceptCurrentVote={this._acceptCurrentVote}
              closeModal={this._closeModal}
              currentVoteItem={currentVoteItem}
              amountToVote={this.state.amountToVote}
              modalVisible={this.state.modalVisible}
              totalRemaining={this.state.totalRemaining}
              totalFrozen={totalFrozen}
              currentVoteCount={currentVotes[currentVoteItem.address] || 0}
            />
          )}
          {this.state.confirmModalVisible && (
            <ConfirmModal
              closeModal={this._closeConfirmModal}
              modalVisible={confirmModalVisible}
              currentFullVotes={currentFullVotes}
              submitVotes={this._submit}
              removeVote={this._removeVoteFromList}
              clearVotes={this._clearVotesFromList}
            />
          )}
        </Utils.Container>
      </Utils.SafeAreaView>
    )
  }
}

export default withContext(VoteScene)
