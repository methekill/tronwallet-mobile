import React, { Component } from 'react'
import { Alert, Vibration } from 'react-native'
import RNTron from 'react-native-tron'
import MixPanel from 'react-native-mixpanel'
import PropTypes from 'prop-types'

// Design
import Input from '../../../../components/Input'
import * as Utils from '../../../../components/Utils'
import { Colors } from '../../../../components/DesignSystem'
import { ExchangePair, ExchangeVariation, ScrollWrapper, PERCENTAGE_OPTIONS } from '../../elements'
import ExchangeBalancePair from '../BalancePair'
import ExchangeButton from '../Button'
import PercentageSelector from '../../../../components/SelectorTile'
import ExchangeTransactions from '../Transactions'

// Utils
import tl from '../../../../utils/i18n'
import { trxValueParse, estimatedBuyCost, LOW_VARIATION, estimatedBuyWanted, getInputType } from '../../../../utils/exchangeUtils'
import { formatFloat } from '../../../../utils/numberUtils'
import { logSentry } from '../../../../utils/sentryUtils'

// Service
import WalletClient from '../../../../services/client'

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
    const { askPinEx, exchangeData, context } = this.props
    const { getCurrentBalances } = context
    const {
      firstTokenName,
      firstTokenBalance,
      secondTokenName,
      secondTokenBalance,
      secondTokenId } = exchangeData

    if (buyAmount <= 0 || !buyAmount) {
      this.buyAmount.focus()
      return
    }

    const expecBuy = estimatedCost || estimatedBuyCost(firstTokenBalance, secondTokenBalance, buyAmount, secondTokenId === '_')

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

    const secondBalanceId = secondTokenId === '_' ? '1' : secondTokenId
    const { balance: userSecondTokenBalance } = getCurrentBalances().find(bl => bl.id === secondBalanceId) || { balance: 0 }

    if (userSecondTokenBalance <= 0 || userSecondTokenBalance < expecBuy) {
      Alert.alert(tl.t('warning'), `You don't have enough ${secondTokenName} to buy ${firstTokenName}`)
      return
    }

    if (askPinEx) {
      this.props.navigation.navigate('Pin', {
        shouldGoBack: true,
        testInput: pin => pin === this.props.context.pin,
        onSuccess: () => {
          const { buyAmount, estimatedCost } = this.state
          const { publicKey } = this.props.context
          MixPanel.trackWithProperties('Pin Validation - Exchange', {
            buyAmount,
            estimatedCost,
            publicKey
          })
          this._exchangeToken()
        }
      })
    } else {
      this._exchangeToken()
    }
  }

  _exchangeToken = async () => {
    const { buyAmount, estimatedCost } = this.state
    const { publicKey, accounts, loadUserData } = this.props.context
    const { exchangeId, firstTokenBalance, secondTokenBalance, secondTokenId, firstTokenId } = this.props.exchangeData

    const quant = estimatedCost
      ? trxValueParse(estimatedCost, secondTokenId === '_')
      : estimatedBuyCost(firstTokenBalance, secondTokenBalance, buyAmount)

    const expected = trxValueParse(buyAmount, firstTokenId === '_')

    this.setState({ loading: true })
    try {
      const exParams = {
        address: publicKey,
        tokenId: secondTokenId,
        exchangeId,
        quant,
        expected
      }

      MixPanel.trackWithProperties('Exchange - Buying', { params: exParams })
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
      logSentry(error, 'Buying Exchange')
      this._setResultTimeout(false)
    }
  }

  _setResultTimeout = result => {
    let nexState = result ? { buyAmount: '', estimatedCost: '', result: false } : { result: false }
    this.sellTimeout = setTimeout(() => this.setState(nexState), 3200)
  }

  _setPercentage = percentage => {
    const { getCurrentBalances } = this.props.context
    const { secondTokenId, price, secondTokenBalance, firstTokenBalance } = this.props.exchangeData

    const secondBalanceId = secondTokenId === '_' ? '1' : secondTokenId
    const { balance } = getCurrentBalances().find(bl => bl.id === secondBalanceId) || { balance: 0 }

    const amountWanted = balance * percentage

    const buyAmount = secondTokenId === '_'
      ? amountWanted * LOW_VARIATION / price
      : estimatedBuyWanted(firstTokenBalance, secondTokenBalance, amountWanted)

    this._changeBuyAmount(buyAmount)
  }

  _getInputType = tokenId => tokenId === '_' ? 'float' : 'int'

  _changeBuyAmount = buyAmount => {
    const {
      firstTokenBalance,
      secondTokenId,
      secondTokenBalance
    } = this.props.exchangeData
    const estimatedCost = estimatedBuyCost(firstTokenBalance, secondTokenBalance, buyAmount || 0, secondTokenId === '_')

    this.setState({buyAmount: Math.round(buyAmount), estimatedCost})
  }

  _renderRightContent = token => (
    <Utils.Text size='small' color={Colors.greyBlue}>
      {token}
    </Utils.Text>
  )

  render () {
    const {
      buyAmount,
      estimatedCost,
      loading,
      result
    } = this.state
    const {
      firstTokenBalance,
      firstTokenId,
      firstTokenName,
      firstTokenAbbr,
      firstTokenImage,
      secondTokenId,
      secondTokenName,
      secondTokenAbbr,
      secondTokenBalance,
      price,
      secondTokenImage } = this.props.exchangeData

    const cost = estimatedBuyCost(firstTokenBalance, secondTokenBalance, buyAmount || 0, secondTokenId === '_')
    const formattedCost = formatFloat(cost)

    const isTokenToToken = firstTokenId !== '_' && secondTokenId !== '_'
    const buyType = getInputType(firstTokenId)
    const estimatedType = getInputType(secondTokenId)

    const minBuy = Math.floor(cost / price)

    const firstTokenAlias = { name: firstTokenName, abbr: firstTokenAbbr, image: firstTokenImage, id: firstTokenId }
    const secondTokenAlias = { name: secondTokenName, abbr: secondTokenAbbr, image: secondTokenImage, id: secondTokenId }

    const firstTokenIdentifier = firstTokenAbbr || firstTokenName
    const secondTokenIdentifier = secondTokenAbbr || secondTokenName

    return (
      <ScrollWrapper>
        <Utils.View height={8} />
        <Utils.View paddingX='medium'>

          <ExchangeBalancePair
            firstToken={secondTokenAlias}
            secondToken={firstTokenAlias}
          />
          <ExchangePair
            firstToken={firstTokenName}
            secondToken={secondTokenName}
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
              rightContent={() => this._renderRightContent(firstTokenIdentifier)}
              placeholder='0'
              keyboardType='numeric'
              type={buyType}
              numbersOnly
              value={buyAmount}
            />
            {isTokenToToken &&
            <Utils.Text size='tiny' font='regular' align='right'>
              {tl.t('exchange.minToBuy', {min: minBuy, tokenId: firstTokenName})}
            </Utils.Text>}
            <Input
              label={tl.t('exchange.estimatedCost')}
              rightContent={() => this._renderRightContent(secondTokenIdentifier)}
              onChangeText={estimatedCost => this.setState({estimatedCost})}
              placeholder={formattedCost}
              keyboardType='numeric'
              type={estimatedType}
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
        </Utils.View>
        <ExchangeTransactions {...this.props} />
      </ScrollWrapper>
    )
  }
}

BuyScene.propTypes = {
  exchangeData: PropTypes.object.isRequired
}

export default BuyScene
