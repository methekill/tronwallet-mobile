import React, { Component } from 'react'
import { Alert } from 'react-native'
import RNTron from 'react-native-tron'
import MixPanel from 'react-native-mixpanel'

// Design
import Input from '../../../components/Input'
import * as Utils from '../../../components/Utils'
import { Colors } from '../../../components/DesignSystem'
import { ExchangePair, ExchangeVariation, ScrollWrapper, PERCENTAGE_OPTIONS } from '../elements'
import ExchangeBalancePair from '../BalancePair'
import ExchangeButton from '../Button'
import PercentageSelector from '../../../components/SelectorTile'

// Utils
import tl from '../../../utils/i18n'
import { withContext } from '../../../store/context'
import { trxValueParse, estimatedBuyCost, LOW_VARIATION } from '../../../utils/exchangeUtils'
import { formatFloat } from '../../../utils/numberUtils'
import { logSentry } from '../../../utils/sentryUtils'

// Service
import WalletClient from '../../../services/client'

class BuyScene extends Component {
  static navigationOptions = { header: null }

  state = {
    buyAmount: '',
    estimatedCost: '',
    loading: false,
    refreshingPrice: false,
    result: false
  }

  componentWillUnmount () {
    clearTimeout(this.buyTimeout)
  }

  _submit = () => {
    const { buyAmount, estimatedCost } = this.state
    const { balances, publicKey } = this.props.context
    const { firstTokenBalance, secondTokenBalance, firstTokenId, secondTokenId } = this.props.exchangeData

    if (buyAmount <= 0 || !buyAmount) {
      this.buyAmount.focus()
      return
    }

    const expecBuy = estimatedCost || estimatedBuyCost(firstTokenBalance, secondTokenBalance, buyAmount, secondTokenId === 'TRX')

    if (expecBuy <= 0) {
      Alert.alert(tl.t('warning'), `Not enough estimated cost `)
      this.buyAmount.focus()
      return
    }

    if (secondTokenBalance < expecBuy) {
      Alert.alert(tl.t('warning'),
        `Not enough trading balance. Currently at ${secondTokenBalance} ${secondTokenId}`)
      this.buyAmount.focus()
      return
    }

    const { balance: userSecondTokenBalance } =
      balances[publicKey].find(bl => bl.name === secondTokenId) || { balance: 0 }

    if (userSecondTokenBalance <= 0 || userSecondTokenBalance < expecBuy) {
      Alert.alert(tl.t('warning'), `You don't have enough ${secondTokenId} to buy ${firstTokenId}`)
      return
    }

    this.props.navigation.navigate('Pin', {
      shouldGoBack: true,
      testInput: pin => pin === this.props.context.pin,
      onSuccess: this._exchangeToken
    })
  }

  _exchangeToken = async () => {
    const { buyAmount, estimatedCost } = this.state
    const { publicKey, accounts, loadUserData } = this.props.context
    const { exchangeId, firstTokenBalance, secondTokenBalance, secondTokenId, firstTokenId } = this.props.exchangeData

    const quant = estimatedCost
      ? trxValueParse(estimatedCost, secondTokenId === 'TRX')
      : estimatedBuyCost(firstTokenBalance, secondTokenBalance, buyAmount)

    const expected = trxValueParse(buyAmount, firstTokenId === 'TRX')

    this.setState({loading: true})
    try {
      const exParams = {
        address: publicKey,
        tokenId: secondTokenId,
        exchangeId,
        quant,
        expected
      }

      MixPanel.trackWithProperties('Exchange', { type: 'Buying', params: exParams })

      const transactionUnsigned = await WalletClient.getExchangeTransaction(exParams)
      const userKey = accounts.find(acc => acc.address === publicKey).privateKey
      const signedTransaction = await RNTron.signTransaction(userKey, transactionUnsigned)

      const { code } = await WalletClient.broadcastTransaction(signedTransaction)

      if (code === 'SUCCESS') {
        this.setState({result: 'success', loading: false})
        loadUserData()
      } else {
        this.setState({result: 'fail', loading: false})
      }
      this._setResultTimeout(code === 'SUCCESS')
    } catch (error) {
      this.setState({result: 'fail', loading: false})
      logSentry(error, 'Buying Exchange')
      this._setResultTimeout(false)
    }
  }

  _setResultTimeout = result => {
    let nexState = result ? { buyAmount: '', estimatedCost: '', result: false } : { result: false }
    this.sellTimeout = setTimeout(() => this.setState(nexState), 3200)
  }

  _setPercentage = percentage => {
    const { balances, publicKey } = this.props.context
    const { secondTokenId, price } = this.props.exchangeData

    const { balance } = balances[publicKey].find(bl => bl.name === secondTokenId) || { balance: 0 }

    const amountWanted = balance * percentage / price
    const buyAmount = secondTokenId === 'TRX' ? amountWanted * LOW_VARIATION : Math.floor(amountWanted)

    this._changeBuyAmount(buyAmount)
  }

  _changeBuyAmount = buyAmount => {
    const {
      firstTokenBalance,
      secondTokenId,
      secondTokenBalance
    } = this.props.exchangeData
    const estimatedCost = estimatedBuyCost(firstTokenBalance, secondTokenBalance, buyAmount || 0, secondTokenId === 'TRX')

    this.setState({buyAmount, estimatedCost})
  }

  _renderRightContent = token =>
    <Utils.Text size='small' color={Colors.greyBlue}>
      {token}
    </Utils.Text>

  render () {
    const {
      buyAmount,
      estimatedCost,
      loading,
      result
    } = this.state
    const {
      firstTokenId,
      firstTokenBalance,
      firstTokenImage,
      secondTokenId,
      secondTokenBalance,
      secondTokenImage,
      price } = this.props.exchangeData

    const cost = estimatedBuyCost(firstTokenBalance, secondTokenBalance, buyAmount || 0, secondTokenId === 'TRX')
    const minBuy = Math.floor(cost / price)
    const isTokenToken = secondTokenId !== 'TRX' && firstTokenId !== 'TRX'
    return (
      <Utils.SafeAreaView>
        <ScrollWrapper>
          <Utils.View height={8} />
          <ExchangeBalancePair
            firstToken={secondTokenId}
            firstTokenImage={secondTokenImage}
            secondToken={firstTokenId}
            secondTokenImage={firstTokenImage}
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
              label={tl.t('buy').toUpperCase()}
              innerRef={input => { this.buyAmount = input }}
              onChangeText={this._changeBuyAmount}
              rightContent={() => this._renderRightContent(firstTokenId)}
              placeholder='0'
              keyboardType='numeric'
              type='float'
              numbersOnly
              value={buyAmount}
            />
            {isTokenToken &&
            <Utils.Text size='tiny' font='regular' align='right'>
              {tl.t('exchange.minToBuy', {min: minBuy, tokenId: firstTokenId})}
            </Utils.Text>}
            <Input
              label={tl.t('exchange.estimatedCost')}
              rightContent={() => this._renderRightContent(secondTokenId)}
              onChangeText={estimatedCost => this.setState({estimatedCost})}
              placeholder={formatFloat(cost)}
              keyboardType='numeric'
              type='float'
              numbersOnly
              value={estimatedCost}
            />
            <ExchangeButton
              text={tl.t('buy').toUpperCase()}
              loading={loading}
              result={result}
              onSubmit={this._submit}
            />
            <ExchangeVariation text={tl.t('exchange.variation.buy')} />
          </Utils.View>
        </ScrollWrapper>
      </Utils.SafeAreaView>
    )
  }
}

export default withContext(BuyScene)
