import React, { Component } from 'react'
import { Alert, Vibration } from 'react-native'
import RNTron from 'react-native-tron'
import MixPanel from 'react-native-mixpanel'

// Design
import Input from '../../../components/Input'
import * as Utils from '../../../components/Utils'
import { ExchangePair, ExchangeVariation, ScrollWrapper, PERCENTAGE_OPTIONS } from '../elements'
import ExchangeBalancePair from '../BalancePair'
import ExchangeButton from '../Button'
import { Colors } from '../../../components/DesignSystem'
import PercentageSelector from '../../../components/SelectorTile'
import ExchangeTransactions from '../Transactions'

// Utils
import tl from '../../../utils/i18n'
import { estimatedSellCost, trxValueParse, HIGH_VARIATION, getInputType } from '../../../utils/exchangeUtils'
import { formatFloat } from '../../../utils/numberUtils'
import { logSentry } from '../../../utils/sentryUtils'

// Service
import WalletClient from '../../../services/client'

class SellScene extends Component {
  static navigationOptions = { header: null }

  state = {
    sellAmount: '',
    estimatedRevenue: '',
    loading: false,
    result: false
  }

  componentWillUnmount () {
    clearTimeout(this.sellTimeout)
  }

  _submit = () => {
    const { sellAmount, estimatedRevenue } = this.state
    const { askPinEx, context, exchangeData } = this.props
    const { balances, publicKey } = context
    const { firstTokenBalance, secondTokenBalance, firstTokenId, secondTokenId } = exchangeData

    if (sellAmount <= 0 || !sellAmount) {
      this.sellAmount.focus()
      return
    }
    const expecRev = estimatedRevenue || estimatedSellCost(firstTokenBalance, secondTokenBalance, sellAmount, secondTokenId === 'TRX')

    if ((firstTokenId !== 'TRX' && parseInt(sellAmount) !== Number(sellAmount)) ||
        (secondTokenId !== 'TRX' && parseInt(expecRev) !== Number(expecRev))) {
      Alert.alert(tl.t('warning'), `Can only trade whole Assets amount`)
      return
    }

    if (expecRev <= 0) {
      Alert.alert(tl.t('warning'), `Can't trade ${estimatedRevenue} ${secondTokenId}`)
      this.sellAmount.focus()
      return
    }

    const { balance: userFirstTokenBalance } =
      balances[publicKey].find(bl => bl.name === firstTokenId) || { balance: 0 }

    if (userFirstTokenBalance <= 0 || userFirstTokenBalance < sellAmount) {
      Alert.alert(tl.t('warning'), `You don't have enough ${firstTokenId} to sell`)
      return
    }

    if (askPinEx) {
      this.props.navigation.navigate('Pin', {
        shouldGoBack: true,
        testInput: pin => pin === this.props.context.pin,
        onSuccess: this._exchangeToken
      })
    } else {
      this._exchangeToken()
    }
  }

  _exchangeToken = async () => {
    const { sellAmount, estimatedRevenue } = this.state
    const { exchangeId, firstTokenId, secondTokenId, firstTokenBalance, secondTokenBalance } = this.props.exchangeData
    const { publicKey, accounts, loadUserData } = this.props.context

    const quant = trxValueParse(sellAmount, firstTokenId === 'TRX')

    const expected = estimatedRevenue
      ? trxValueParse(estimatedRevenue, secondTokenId === 'TRX')
      : estimatedSellCost(firstTokenBalance, secondTokenBalance, sellAmount)

    this.setState({loading: true})

    try {
      const exParams = {
        address: publicKey,
        tokenId: firstTokenId,
        quant,
        exchangeId,
        expected
      }
      MixPanel.trackWithProperties('Exchange', { type: 'Selling', params: exParams })

      const transactionUnsigned = await WalletClient.getExchangeTransaction(exParams)
      const userKey = accounts.find(acc => acc.address === publicKey).privateKey
      const signedTransaction = await RNTron.signTransaction(userKey, transactionUnsigned)

      const { code } = await WalletClient.broadcastTransaction(signedTransaction)

      if (code === 'SUCCESS') {
        this.setState({result: 'success', loading: false})
        Vibration.vibrate()
        loadUserData()
      } else {
        this.setState({result: 'fail', loading: false})
      }

      this._setResultTimeout(code === 'SUCCESS')
    } catch (error) {
      this.setState({result: 'fail', loading: false})
      logSentry(error, 'Selling Exchange')
      this._setResultTimeout(false)
    }
  }

  _setResultTimeout = result => {
    let nexState = result ? { sellAmount: '', estimatedRevenue: '', result: false } : { result: false }
    this.sellTimeout = setTimeout(() => this.setState(nexState), 3200)
  }

  _setPercentage = percentage => {
    const { balances, publicKey } = this.props.context
    const { firstTokenId } = this.props.exchangeData

    const { balance } = balances[publicKey].find(bl => bl.name === firstTokenId) || { balance: 0 }
    const amountWanted = balance * percentage
    const sellAmount = firstTokenId === 'TRX' ? amountWanted * HIGH_VARIATION : Math.floor(amountWanted)
    this._changeSellAmount(sellAmount)
  }

  _changeSellAmount = sellAmount => {
    const {
      firstTokenBalance,
      secondTokenId,
      secondTokenBalance
    } = this.props.exchangeData
    const estimatedRevenue = estimatedSellCost(firstTokenBalance, secondTokenBalance, sellAmount || 0, secondTokenId === 'TRX')

    this.setState({sellAmount, estimatedRevenue})
  }

  _renderRightContent = text => (
    <Utils.Text size='small' color={Colors.greyBlue}>
      {text}
    </Utils.Text>
  )

  render () {
    const {
      sellAmount,
      loading,
      estimatedRevenue,
      result } = this.state
    const {
      firstTokenBalance,
      secondTokenId,
      secondTokenBalance,
      firstTokenId,
      price,
      firstTokenImage,
      secondTokenImage
    } = this.props.exchangeData

    const cost = estimatedSellCost(firstTokenBalance, secondTokenBalance, sellAmount || 0, secondTokenId === 'TRX')
    const formattedCost = formatFloat(cost)

    const isTokenToToken = secondTokenId !== 'TRX' && firstTokenId !== 'TRX'
    const sellType = getInputType(firstTokenId)
    const estimatedType = getInputType(secondTokenId)

    const minToSell = Math.round((1 / price) * 1.05) /* Used in Token To Token transaction, it needs to have a hihger variation when selling */

    return (
      <ScrollWrapper>
        <Utils.View height={8} />
        <Utils.View paddingX='medium'>

          <ExchangeBalancePair
            firstToken={firstTokenId}
            firstTokenImage={firstTokenImage}
            secondToken={secondTokenId}
            secondTokenImage={secondTokenImage}
          />
          <ExchangePair
            firstToken={firstTokenId}
            secondToken={secondTokenId}
            price={price}
          />
          <Utils.View paddingY='small'>
            <PercentageSelector
              options={PERCENTAGE_OPTIONS}
              onItemPress={this._setPercentage}
            />
          </Utils.View>
          <Utils.View flex={1} justify='center'>
            <Input
              label={tl.t('sell').toUpperCase()}
              innerRef={input => { this.sellAmount = input }}
              onChangeText={this._changeSellAmount}
              rightContent={() => this._renderRightContent(firstTokenId)}
              placeholder='0'
              keyboardType='numeric'
              type={sellType}
              numbersOnly
              value={sellAmount}
            />
            {isTokenToToken &&
              <Utils.Text size='tiny' font='regular' align='right'>
                {tl.t('exchange.minToSell', {min: minToSell, tokenId: firstTokenId})}
              </Utils.Text>}
            <Input
              label={tl.t('exchange.estimatedRevenue')}
              rightContent={() => this._renderRightContent(secondTokenId)}
              onChangeText={estimatedRevenue => this.setState({estimatedRevenue})}
              placeholder={formattedCost}
              keyboardType='numeric'
              type={estimatedType}
              numbersOnly
              value={estimatedRevenue}
            />
            <ExchangeButton
              text={tl.t('sell').toUpperCase()}
              loading={loading}
              result={result}
              onSubmit={this._submit}
            />
            <ExchangeVariation text={tl.t('exchange.variation.sell')} />
          </Utils.View>
        </Utils.View>
        <ExchangeTransactions {...this.props} />
      </ScrollWrapper>
    )
  }
}

export default SellScene
