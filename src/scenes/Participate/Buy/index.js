import React, { Component } from 'react'
import { Alert, ActivityIndicator } from 'react-native'
import MixPanel from 'react-native-mixpanel'

import { withContext } from '../../../store/context'

// Design
import * as Utils from '../../../components/Utils'
import { Colors } from '../../../components/DesignSystem'
import ButtonGradient from '../../../components/ButtonGradient'
import NavigationHeader from '../../../components/Navigation/Header'
import OptionBuy from '../../../components/Vote/InOutOption'

import {
  BuyText,
  WhiteBuyText,
  BuyContainer,
  VerticalSpacer,
  AmountText,
  MarginFixer,
  TrxValueText
} from '../Elements'

// Utils
import tl from '../../../utils/i18n'
import { formatNumber } from '../../../utils/numberUtils'
import Client, { ONE_TRX } from '../../../services/client'
import { signTransaction } from '../../../utils/transactionUtils'
import { logSentry, DataError } from '../../../utils/sentryUtils'
import { replaceRoute } from '../../../utils/navigationUtils'
import KeyboardScreen from '../../../components/KeyboardScreen'

const buyOptions = {
  1: 1,
  5: 5,
  10: 10,
  25: 25,
  50: 50,
  100: 100,
  500: 500,
  1000: 1000,
  '10k': 10000,
  '100k': 100000,
  '500k': 500000,
  '1m': 1000000
}

class BuyScene extends Component {
  static navigationOptions = { header: null }

  state = {
    totalRemaining: 0,
    amountToBuy: 0,
    trxBalance: 0,
    notEnoughTrxBalance: false,
    loading: false
  }

  async componentDidMount () {
    this._updateBalance()
  }

  componentDidUpdate (prevProps) {
    const { publicKey } = this.props.context
    const { publicKey: prevPublicKey } = prevProps.context

    if (publicKey !== prevPublicKey) {
      this._updateBalance()
    }
  }

  _updateBalance = async () => {
    const { getCurrentBalances } = this.props.context
    const currentBalances = getCurrentBalances()
    if (currentBalances.length) {
      const { balance: trxBalance } = currentBalances.find(b => b.id === '1')
      this.setState({
        trxBalance: this._fixNumber(trxBalance),
        totalRemaining: trxBalance,
        amountToBuy: 0
      })
    }
  }

  _fixNumber = value => {
    if (Number.isInteger(value)) return value
    else return value.toFixed(5) > 0 ? value.toFixed(5) : value.toFixed(2)
  }

  _incrementVoteCount = quant => {
    const { price } = this.props.navigation.state.params.item
    const { amountToBuy, totalRemaining } = this.state
    const amountToPay = price / ONE_TRX * quant

    if (amountToPay > totalRemaining) {
      this.setState({ notEnoughTrxBalance: true })
      return
    }
    this.setState({
      amountToBuy: amountToBuy + quant,
      totalRemaining: totalRemaining - this._fixNumber(amountToPay),
      notEnoughTrxBalance: false
    })
  }

  _allinVoteCount = () => {
    const { price } = this.props.navigation.state.params.item
    const { trxBalance } = this.state

    const amountToBuy = Math.floor(trxBalance / (price / ONE_TRX))
    if (amountToBuy > 0) {
      const amountToPay = this._fixNumber(amountToBuy * (price / ONE_TRX))
      this.setState({
        amountToBuy: amountToBuy,
        totalRemaining: trxBalance - amountToPay,
        notEnoughTrxBalance: false
      })
    } else {
      this.setState({ notEnoughTrxBalance: true })
    }
  }

  _clearVoteCount = () => {
    this.setState({
      amountToBuy: 0,
      totalRemaining: this.state.trxBalance,
      notEnoughTrxBalance: false
    })
  }

  _renderPadkeys = () =>
    Object.keys(buyOptions).map((buyKey, index) => {
      const { loading } = this.state
      const item = this.props.navigation.getParam('item', {})
      const totalPossible = this.state.trxBalance * ONE_TRX / item.price
      const totalRemainingToBuy =
        this.state.totalRemaining * ONE_TRX / item.price
      const isDisabled = buyOptions[buyKey] > totalRemainingToBuy

      if (totalPossible < 10000 && buyOptions[buyKey] >= 10000) return
      return (
        <Utils.NumKeyWrapper
          disabled={isDisabled || loading}
          key={buyKey}
          flexBasis={25}
        >
          <Utils.NumKey
            disabled={isDisabled}
            onPress={() => this._incrementVoteCount(buyOptions[buyKey])}
          >
            <Utils.Text font='regular' primary>
              +{buyKey}
            </Utils.Text>
          </Utils.NumKey>
        </Utils.NumKeyWrapper>
      )
    })

  _submit = async () => {
    const { systemAddress, publicKey } = this.props.context
    const item = this.props.navigation.getParam('item', {})
    const { trxBalance, amountToBuy } = this.state
    const amountToPay = amountToBuy * (item.price / ONE_TRX)
    this.setState({ loading: true })
    try {
      if (trxBalance < amountToPay) {
        throw new DataError('INSUFFICIENT_BALANCE')
      }
      if (amountToPay < 1) {
        throw new DataError('INSUFFICIENT_TRX')
      }

      const participatePayload = item.isExchangeable
        ? {
          from: publicKey,
          to: systemAddress.exchangeBot.address,
          token: 'TRX',
          amount: this._fixNumber(amountToPay),
          data: `@token=${item.contentfulId}`
        }
        : {
          participateAddress: item.ownerAddress,
          participateToken: item.id,
          participateAmount: this._fixNumber(amountToPay)
        }
      const data = item.isExchangeable
        ? await Client.getTransferTransaction(participatePayload)
        : await Client.getParticipateTransaction(this.props.context.publicKey, participatePayload)

      await this._openTransactionDetails(data)
      MixPanel.trackWithProperties('Buy token', { token: item.name })
    } catch (err) {
      if (err.name === 'DataError') {
        if (err.message === 'INSUFFICIENT_BALANCE') {
          Alert.alert(tl.t('participate.error.insufficientBalance'))
        }
        if (err.message === 'INSUFFICIENT_TRX') {
          Alert.alert(
            tl.t('participate.error.insufficientTrx.title', {
              token: item.name
            }),
            tl.t('participate.error.insufficientTrx.message', {
              amount: this._fixNumber(amountToPay)
            })
          )
        }
      } else {
        logSentry(err, 'Participate - Submit')
        Alert.alert(tl.t('warning'), tl.t('error.default'))
      }
    } finally {
      this.setState({ loading: false })
    }
  }

  _openTransactionDetails = async transactionUnsigned => {
    try {
      const { amountToBuy } = this.state
      const { accounts, publicKey } = this.props.context
      const item = this.props.navigation.getParam('item', {})

      const transactionSigned = await signTransaction(
        accounts.find(item => item.address === publicKey).privateKey,
        transactionUnsigned
      )
      this.setState({ loading: false }, () => {
        this.props.navigation.goBack()
        replaceRoute(this.props.navigation, 'SubmitTransaction', {
          tx: transactionSigned,
          tokenAmount: amountToBuy,
          exchangeOption: {
            isExchangeable: item.isExchangeable,
            trxAmount: amountToBuy * item.price / ONE_TRX,
            assetName: item.name,
            assetId: item.id
          }
        })
      })
    } catch (e) {
      logSentry(e, 'Participate - Open Tx')
      Alert.alert(tl.t('error.gettingTransaction'))
    }
  }

  render () {
    const {
      totalRemaining,
      amountToBuy,
      notEnoughTrxBalance,
      loading
    } = this.state
    const { navigation } = this.props
    const item = navigation.getParam('item', {})
    const { name, price } = item

    const amountToPay = price / ONE_TRX * amountToBuy
    const tokenPrice = price / ONE_TRX
    return (
      <Utils.SafeAreaView>
        <KeyboardScreen>
          <NavigationHeader
            title={item.name}
            onBack={() => navigation.goBack()}
          />
          <BuyContainer>
            <Utils.Row justify='space-around'>
              <Utils.View align='center' justify='center'>
                <BuyText>{tl.t('participate.balance')}</BuyText>
                <VerticalSpacer size={8} />
                <BuyText white>{formatNumber(totalRemaining)} TRX</BuyText>
              </Utils.View>
              <Utils.View align='center' justify='center'>
                <BuyText>{tl.t('participate.pricePerToken')}</BuyText>
                <VerticalSpacer size={8} />
                <BuyText white> {tokenPrice} TRX</BuyText>
              </Utils.View>
            </Utils.Row>
            <VerticalSpacer size={28} />
            <BuyText>{tl.t('participate.enterAmountToBuy')}</BuyText>
            <AmountText>{formatNumber(amountToBuy)}</AmountText>
            <TrxValueText>
              {formatNumber(amountToPay.toFixed(6))} TRX
            </TrxValueText>
            {notEnoughTrxBalance && (
              <React.Fragment>
                <VerticalSpacer size={4} />
                <WhiteBuyText>
                  {tl.t('participate.warning', { token: name })}
                </WhiteBuyText>
                <VerticalSpacer size={4} />
              </React.Fragment>
            )}
            <VerticalSpacer size={13} />
          </BuyContainer>
          <MarginFixer>
            <Utils.Row wrap='wrap'>{this._renderPadkeys()}</Utils.Row>
          </MarginFixer>
          <VerticalSpacer size={14} />
          <MarginFixer>
            <Utils.Row>
              <OptionBuy
                title={tl.t('clear')}
                disabled={amountToBuy === 0 || loading}
                onPress={this._clearVoteCount}
              />
              <OptionBuy
                title={tl.t('allIn')}
                disabled={
                  totalRemaining <= 0 || totalRemaining < tokenPrice || loading
                }
                onPress={this._allinVoteCount}
              />
            </Utils.Row>
          </MarginFixer>
          <BuyContainer>
            {loading
              ? (<ActivityIndicator size='small' color={Colors.primaryText} />)
              : (
                <ButtonGradient
                  disabled={amountToBuy === 0 || loading}
                  onPress={() => this._submit()}
                  text={tl.t('participate.button.confirm')}
                />
              )}
          </BuyContainer>
        </KeyboardScreen>
      </Utils.SafeAreaView>
    )
  }
}
export default withContext(BuyScene)
