import React from 'react'
import moment from 'moment'
import {
  ScrollView,
  Clipboard,
  View,
  Text,
  RefreshControl,
  TouchableOpacity
} from 'react-native'
import { string, number, bool, shape, array } from 'prop-types'
import Ionicons from 'react-native-vector-icons/Ionicons'
import Toast from 'react-native-easy-toast'
import LinearGradient from 'react-native-linear-gradient'
import forIn from 'lodash/forIn'
import MixPanel from 'react-native-mixpanel'

import tl from '../../utils/i18n'
import { updateTransactionByHash, getTranslatedType, getTokenPriceFromStore } from '../../utils/transactionUtils'
import getTransactionStore from '../../store/transactions'
import IconButton from '../../components/IconButton'
import * as Utils from '../../components/Utils'
import * as Elements from './Elements'
import NavigationHeader from '../../components/Navigation/Header'
import { Colors } from '../../components/DesignSystem'
import { ONE_TRX } from '../../services/client'
import { rgb } from '../../../node_modules/polished'
import ActionModal from '../../components/ActionModal'
import FontelloIcon from '../../components/FontelloIcon'
import Badge from '../../components/Badge'

import { formatFloat, formatNumber } from '../../utils/numberUtils'
import getAssetsStore from '../../store/assets'
import { logSentry } from '../../utils/sentryUtils'
import onBackgroundHandler from '../../utils/onBackgroundHandler'
import { withContext } from '../../store/context'

class TransactionDetails extends React.Component {
  static navigationOptions = { header: null }

  static propTypes = {
    navigation: shape({
      state: shape({
        params: shape({
          id: string,
          type: string,
          timestamp: number,
          ownerAddress: string,
          confirmed: bool,
          block: string,
          tokenPrice: number,
          contractData: shape({
            tokenName: string,
            transferFromAddress: string,
            transferToAddress: string,
            amount: number,
            frozenBalance: number,
            description: string,
            startTime: number,
            endTime: number,
            totalSupply: number,
            unityValue: number,
            votes: array
          })
        })
      })
    })
  }

  state = {
    refreshing: false,
    item: null,
    currentAddress: null,
    modalVisible: false
  }

  async componentDidMount () {
    const item = this.props.navigation.getParam('item', {})
    this.setState({ item })
    MixPanel.track('Load transaction detail')
    this.appStateListener = onBackgroundHandler(this._onAppStateChange)
  }

  componentDidUpdate (prevProps, prevState) {
    const nextItem = this.props.navigation.getParam('item', {})
    const prevItem = prevState.item || {}
    if (nextItem.id !== prevItem.id) {
      this.setState({ item: nextItem }, this._checkTransaction)
    }
  }

  componentWillUnmount () {
    clearTimeout(this.checkTransactionTimeout)
    this.appStateListener.remove()
  }

  _onAppStateChange = nextAppState => {
    if (nextAppState.match(/background/)) {
      this.setState({ modalVisible: false })
    }
  }
  _closeModal = () => {
    this.setState({
      modalVisible: false,
      currentAddress: null
    })
  }

  _copy = async () => {
    const { id } = this.state.item
    try {
      await Clipboard.setString(`https://tronscan.org/#/transaction/${id}`)
      this.refs.hashToast.show(tl.t('transactionDetails.clipboard.tronscanUrl'))
    } catch (error) {
      this.refs.hashToast.show(tl.t('error.clipboardCopied'))
      logSentry(error, 'Transaction Detail - onCopy')
    }
  }

  _renderCard = () => {
    const { id, confirmed, timestamp, block } = this.state.item

    return (
      <React.Fragment>
        <Utils.View
          style={{
            position: 'absolute',
            right: 16,
            top: 75,
            zIndex: 999
          }}
        >
          <IconButton
            icon='md-copy'
            bg={Colors.summaryText}
            highlight
            iconColor='#FFFFFF'
            onPress={() => this._copy()}
          />
        </Utils.View>
        <Utils.View
          borderRadius={10}
          marginTop={20}
          borderTopWidth={10}
          borderTopColor={confirmed ? Colors.confirmed : Colors.unconfirmed}
          overflow='hidden'
        >
          <LinearGradient
            start={{ x: 0, y: 1 }}
            end={{ x: 1, y: 0 }}
            colors={[
              Colors.transactionCardGradient[0],
              Colors.transactionCardGradient[1]
            ]}
          >
            <View
              style={{
                marginHorizontal: 18,
                marginVertical: 20
              }}
            >
              <Toast
                ref='hashToast'
                position='top'
                fadeInDuration={750}
                fadeOutDuration={1000}
                opacity={0.8}
              />
              <Utils.Row align='center' justify='space-between'>
                <Elements.DetailLabel>
                  {tl.t('transactionDetails.hash')}
                </Elements.DetailLabel>
              </Utils.Row>
              <View style={{ height: 10 }} />
              <Text
                style={{
                  fontFamily: 'Rubik-Regular',
                  fontSize: 14,
                  lineHeight: 24,
                  marginRight: 40,
                  color: 'white'
                }}
              >
                {id}
              </Text>
              <View
                style={{
                  height: 1,
                  backgroundColor: 'black',
                  marginTop: 16,
                  marginBottom: 20
                }}
              />
              <View>
                <Utils.Column>
                  <Utils.Row align='center' justify='space-between'>
                    <Elements.DetailLabel>
                      {tl.t('transactionDetails.status')}
                    </Elements.DetailLabel>
                    <Utils.VerticalSpacer />
                    <Elements.DetailText>
                      {confirmed ? tl.t('confirmed') : tl.t('unconfirmed')}
                    </Elements.DetailText>
                  </Utils.Row>
                  <Utils.VerticalSpacer size='medium' />
                  <Utils.Row align='center' justify='space-between'>
                    <Elements.DetailLabel>
                      {tl.t('transactionDetails.time')}
                    </Elements.DetailLabel>
                    <Elements.DetailText>
                      {moment(timestamp).format('DD/MM/YYYY hh:mm A')}
                    </Elements.DetailText>
                  </Utils.Row>
                  <Utils.VerticalSpacer size='medium' />
                  <Utils.Row align='center' justify='space-between'>
                    <Elements.DetailLabel>
                      {tl.t('transactionDetails.block')}
                    </Elements.DetailLabel>
                    <Elements.DetailText>{block}</Elements.DetailText>
                  </Utils.Row>
                </Utils.Column>
              </View>
            </View>
          </LinearGradient>
        </Utils.View>
      </React.Fragment>
    )
  }

  _getHeaderBadgeColor = type => {
    switch (type.toLowerCase()) {
      case 'create':
        return '#94C047'
      case 'unfreeze':
        return 'teal'
      case 'freeze':
        return '#25B9E3'
      case 'participate':
        return '#6442E4'
      case 'vote':
        return '#BB2DC4'
      case 'exchange':
        return Colors.strongBlue
      default:
        return '#4a69e2'
    }
  }

  _getIcon = (name, size, color) => (
    <Ionicons name={name} size={size} color={color} />
  )

  _getHeaderArrowIcon = type => {
    const lowerType = type.toLowerCase()
    const size = 45

    if (lowerType === 'unfreeze') {
      return this._getIcon('ios-unlock', size, '#ffffff')
    }
    if (lowerType === 'freeze') {
      return this._getIcon('ios-lock', size, '#ffffff')
    }
    if (lowerType === 'participate') {
      return this._getIcon('ios-arrow-round-up', size, rgb(63, 231, 123))
    }
    if (lowerType === 'transaction') {
      return this._getIcon('ios-arrow-round-down', size, rgb(255, 68, 101))
    }

    return null
  }

  _getHeaderToken = (type, tokenName) => {
    if (type.toLowerCase() === 'vote') return 'TP'
    if (tokenName) return tokenName
    return 'TRX'
  }

  _getHeaderAmountText = type => {
    switch (type.toLowerCase()) {
      case 'freeze':
        return tl.t('transactionDetails.frozenBalance')
      case 'unfreeze':
        return tl.t('transactionDetails.unfrozenBalance')
      case 'vote':
        return tl.t('transactionDetails.totalVotes')
      default:
        return tl.t('transactionDetails.amount')
    }
  }

  _getHeaderAmount = () => {
    const {
      type,
      contractData: { amount, frozenBalance, votes }
    } = this.state.item

    switch (type.toLowerCase()) {
      case 'freeze':
        return frozenBalance
      case 'unfreeze':
        return frozenBalance
      case 'vote':
        return Object.keys(votes).reduce((acc, curr) => acc + Number(votes[curr].voteCount), 0)
      default:
        return amount
    }
  }

  _renderHeader = () => {
    const { item: { type, contractData, tokenPrice } } = this.state
    let {tokenName, tokenId} = contractData
    const tokenToDisplay = this._getHeaderToken(type, tokenName)
    const amountText = this._getHeaderAmountText(type)
    const amountValue = this._getHeaderAmount()

    let amount
    if (type === 'Freeze' || type === 'Unfreeze' || (type === 'Transfer' && tokenId === '1')) {
      amount = amountValue / ONE_TRX
    } else if (type === 'Participate') {
      amount = amountValue / ONE_TRX / (tokenPrice / ONE_TRX)
    } else if (type === 'Exchange') {
      amount = amountValue / (tokenId === '_' ? ONE_TRX : 1)
    } else {
      amount = amountValue
    }
    amount = formatNumber(amount)
    tokenId = tokenId === '_' ? '1' : tokenId

    return (
      <View style={{ alignItems: 'center' }} >
        <View
          style={{
            borderRadius: 5,
            height: 22,
            backgroundColor: this._getHeaderBadgeColor(type),
            justifyContent: 'center',
            paddingHorizontal: 10
          }}
        >
          <Elements.BadgeText>
            {getTranslatedType(type).toUpperCase()}
          </Elements.BadgeText>
        </View>
        <View style={{ height: 12 }} />
        {type.toLowerCase() !== 'create' &&
          type.toLowerCase() !== 'unfreeze' && (
            <React.Fragment>
              <Text
                style={{
                  fontFamily: 'Rubik-Medium',
                  fontSize: 11,
                  lineHeight: 11,
                  letterSpacing: 0.6,
                  color: '#7476a2'
                }}
              >
                {amountText}
              </Text>
              <Utils.Row align='center'>

                <View style={{ width: 11, height: 1 }} />
                <View
                  style={{
                    borderRadius: 2,
                    opacity: 0.97,
                    justifyContent: 'center',
                    alignItems: 'center',
                    paddingHorizontal: 8
                  }}
                >
                  <Elements.AmountText>
                    {amount < 1 ? amount : formatFloat(amount)}
                  </Elements.AmountText>
                  <Badge id={tokenId}>{tokenToDisplay}</Badge>
                </View>
                <Utils.HorizontalSpacer size='medium' />
                {this._getHeaderArrowIcon(type)}
              </Utils.Row>
            </React.Fragment>
          )}
      </View>
    )
  }

  _truncateAddress = address =>
    `${address.substring(0, 8)}...${address.substring(
      address.length - 8,
      address.length
    )}`

  _onAddContactPress = () => {
    const { currentAddress } = this.state
    const { navigation } = this.props

    this._closeModal()
    navigation.navigate('AddContact', { address: currentAddress })
  }

  _onCopyAddressPress = async () => {
    const { currentAddress } = this.state
    try {
      await Clipboard.setString(currentAddress)
      this._showToast(tl.t('transactionDetails.clipboard.publicKey'))
    } catch (error) {
      this._showToast(tl.t('error.clipboardCopied'))
      logSentry(error, 'Transaction Detail - on Copy Press')
    } finally {
      this._closeModal()
    }
  }

  _onAddressPress = addressName => {
    const { systemAddress } = this.props.context
    let systemFixedAddress = addressName

    forIn(systemAddress, (sys) => {
      if (sys.name === addressName) {
        systemFixedAddress = sys.address
        return false
      }
    })

    this.setState({
      modalVisible: true,
      currentAddress: systemFixedAddress
    })
  }

  _renderAddressModal = () => {
    const { modalVisible } = this.state
    return (
      <ActionModal
        visible={modalVisible}
        closeModal={this._closeModal}
        animationType='fade'
        actions={[
          {
            onPress: this._onAddContactPress,
            text: tl.t('addressBook.contacts.addToContacts'),
            icon: <FontelloIcon name='notebook' color='white' size={22} />
          },
          {
            onPress: this._onCopyAddressPress,
            text: tl.t('copyAddress'),
            icon: <FontelloIcon name='copy' color='white' size={22} />
          }
        ]}
      />
    )
  }

  _renderToFrom = () => {
    const {
      type,
      confirmed,
      contractData: { transferFromAddress, transferToAddress }
    } = this.state.item

    return (
      <View>
        {this._renderAddressModal()}
        {type.toLowerCase() === 'transfer' && (
          <TouchableOpacity
            disabled={transferToAddress[0] === '@'}
            onPress={() => {
              this._onAddressPress(transferToAddress)
            }}
          >
            <Elements.AddressRow>
              <Elements.AddressText>
                {tl.t('transactionDetails.to')}
              </Elements.AddressText>
              {this._getIcon(
                'ios-arrow-round-up',
                30,
                confirmed ? rgb(63, 231, 123) : rgb(102, 104, 143)
              )}
            </Elements.AddressRow>
            <Elements.CopiableText>{transferToAddress}</Elements.CopiableText>
            <Elements.Divider />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          disabled={transferFromAddress[0] === '@'}
          onPress={() => {
            this._onAddressPress(transferFromAddress)
          }}
        >
          <Elements.AddressRow>
            <Elements.AddressText>
              {tl.t('transactionDetails.from')}
            </Elements.AddressText>
            {this._getIcon(
              'ios-arrow-round-down',
              30,
              confirmed ? rgb(255, 68, 101) : rgb(102, 104, 143)
            )}
          </Elements.AddressRow>
          <Elements.CopiableText>{transferFromAddress}</Elements.CopiableText>
        </TouchableOpacity>
      </View>
    )
  }

  _renderCreateBody = () => {
    const {
      tokenName,
      unityValue,
      totalSupply,
      startTime,
      endTime,
      description
    } = this.state.item.contractData

    return (
      <Utils.Container>
        <Utils.Row>
          <Utils.Column>
            <Elements.Label>
              {tl.t('transactionDetails.tokenName')}
            </Elements.Label>
            <Utils.VerticalSpacer size='xsmall' />
            <Elements.DetailText>{tokenName}</Elements.DetailText>
          </Utils.Column>
          <Utils.Column position='absolute' left='50%'>
            <Elements.Label>
              {tl.t('transactionDetails.unityValue')}
            </Elements.Label>
            <Utils.VerticalSpacer size='xsmall' />
            <Elements.DetailText>
              {(unityValue / ONE_TRX).toFixed(2)} TRX
            </Elements.DetailText>
          </Utils.Column>
        </Utils.Row>
        <Utils.VerticalSpacer size='big' />
        <Utils.Column>
          <Elements.Label>
            {tl.t('transactionDetails.totalSupply')}
          </Elements.Label>
          <Utils.VerticalSpacer size='xsmall' />
          <Elements.DetailText>{totalSupply}</Elements.DetailText>
        </Utils.Column>
        <Utils.VerticalSpacer size='big' />
        <Utils.Row>
          <Utils.Column>
            <Elements.Label>
              {tl.t('transactionDetails.startTime')}
            </Elements.Label>
            <Utils.VerticalSpacer size='xsmall' />
            <Elements.DetailText>
              {moment(startTime).format('DD/MM/YYYY hh:mm A')}
            </Elements.DetailText>
          </Utils.Column>
          <Utils.Column position='absolute' left='50%'>
            <Elements.Label>
              {tl.t('transactionDetails.endTime')}
            </Elements.Label>
            <Utils.VerticalSpacer size='xsmall' />
            <Elements.DetailText>
              {moment(endTime).format('DD/MM/YYYY hh:mm A')}
            </Elements.DetailText>
          </Utils.Column>
        </Utils.Row>
        <Utils.VerticalSpacer size='big' />
        <Utils.Column>
          <Elements.Label>
            {tl.t('transactionDetails.description')}
          </Elements.Label>
          <Utils.VerticalSpacer size='xsmall' />
          <Elements.DetailText>{description}</Elements.DetailText>
        </Utils.Column>
      </Utils.Container>
    )
  }

  _copyAddress = async () => {
    await Clipboard.getString()
  }

  _showToast = text => {
    this.refs.addressToast.show(text)
  }

  _renderVotes = () => {
    const { votes } = this.state.item.contractData

    const votesToRender = votes.map((vote, index) => (
      <React.Fragment key={`${vote.voteAddress}-${index}`}>
        {this._renderAddressModal()}
        <Elements.AddressRow>
          <TouchableOpacity onPress={() => { this._onAddressPress(vote.voteAddress) }} >
            <Elements.CopiableText>{vote.voteAddress}</Elements.CopiableText>
          </TouchableOpacity>
          <Elements.VoteText>{vote.voteCount}</Elements.VoteText>
        </Elements.AddressRow>
        <Utils.VerticalSpacer size='medium' />
      </React.Fragment>
    ))

    return (
      <Utils.Column>
        <Utils.VerticalSpacer size='medium' />
        <Utils.Row justify='space-between'>
          <Text
            style={{
              fontFamily: 'Rubik-Medium',
              fontSize: 11,
              lineHeight: 11,
              letterSpacing: 0.6,
              color: rgb(116, 118, 162)
            }}
          >
            {tl.t('transactionDetails.votedAddress')}
          </Text>
          <Text
            style={{
              fontFamily: 'Rubik-Medium',
              fontSize: 11,
              lineHeight: 11,
              letterSpacing: 0.6,
              color: rgb(116, 118, 162)
            }}
          >
            {tl.t('transactionDetails.amount')}
          </Text>
        </Utils.Row>
        <Utils.VerticalSpacer size='medium' />
        {votesToRender}
      </Utils.Column>
    )
  }

  _renderDetails = () => {
    const lowerType = this.state.item.type.toLowerCase()
    switch (lowerType) {
      case 'transfer':
        return this._renderToFrom()
      case 'vote':
        return this._renderVotes()
      case 'create':
        return this._renderCreateBody()
      case 'participate':
        return this._renderToFrom()
      default:
        return null
    }
  }

  _checkTransaction = async () => {
    const { item, refreshing } = this.state
    if (!item.confirmed && !refreshing) {
      this.checkTransactionTimeout = setTimeout(async () => {
        await this._onRefresh()
        this._checkTransaction()
      }, 2500)
    }
  }

  _onRefresh = async () => {
    const { item } = this.state
    this.setState({ refreshing: true })
    try {
      await updateTransactionByHash(item.id, this.props.context.publickey)
      const transaction = await this._getTransactionByHash(item.id)
      if (transaction.type === 'Participate') {
        const assetStore = await getAssetsStore()
        const tokenPrice = getTokenPriceFromStore(transaction.contractData.tokenId, assetStore)
        transaction.tokenPrice = tokenPrice
      }
      this.setState({ item: transaction, refreshing: false })
    } catch (e) {
      this.setState({ refreshing: false })
      logSentry(e, 'Transaction Detail - on refresh')
    }
  }

  _getTransactionByHash = async hash => {
    const store = await getTransactionStore()
    return store
      .objects('Transaction')
      .filtered(`id = '${hash}'`)
      .map(item => Object.assign({}, item))[0]
  }

  render () {
    const { item, refreshing } = this.state

    return (
      <Utils.SafeAreaView>
        <NavigationHeader
          title={tl.t('transactionDetails.title')}
          onBack={() => this.props.navigation.goBack()}
        />
        <Utils.Container>
          <ScrollView
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={this._onRefresh}
              />
            }
          >
            {item && (
              <React.Fragment>
                {this._renderHeader()}
                <Utils.View paddingX='large'>
                  {this._renderCard()}
                </Utils.View>
                <Utils.View paddingX='large'>
                  <Utils.VerticalSpacer size='medium' />
                  {this._renderDetails()}
                </Utils.View>
                <Utils.VerticalSpacer size='medium' />
              </React.Fragment>
            )}
          </ScrollView>
          <Toast
            ref='addressToast'
            positionValue={260}
            fadeInDuration={750}
            fadeOutDuration={1000}
            opacity={0.8}
          />
        </Utils.Container>
      </Utils.SafeAreaView>
    )
  }
}

export default withContext(TransactionDetails)
