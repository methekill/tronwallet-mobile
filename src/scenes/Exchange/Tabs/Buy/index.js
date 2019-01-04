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
    const { balances, publicKey } = context
    const { firstTokenBalance, secondTokenBalance, firstTokenId, secondTokenId } = exchangeData

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
      ? trxValueParse(estimatedCost, secondTokenId === 'TRX')
      : estimatedBuyCost(firstTokenBalance, secondTokenBalance, buyAmount)

    const expected = trxValueParse(buyAmount, firstTokenId === 'TRX')

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
    const { balances, publicKey } = this.props.context
    const { secondTokenId, price, secondTokenBalance, firstTokenBalance } = this.props.exchangeData

    const { balance } = balances[publicKey].find(bl => bl.name === secondTokenId) || { balance: 0 }

    const amountWanted = balance * percentage

    const buyAmount = secondTokenId === 'TRX'
      ? amountWanted * LOW_VARIATION / price
      : estimatedBuyWanted(firstTokenBalance, secondTokenBalance, amountWanted)

    this._changeBuyAmount(buyAmount)
  }

  _getInputType = tokenId => tokenId === 'TRX' ? 'float' : 'int'

  _changeBuyAmount = buyAmount => {
    const {
      firstTokenBalance,
      secondTokenId,
      secondTokenBalance
    } = this.props.exchangeData
    const estimatedCost = estimatedBuyCost(firstTokenBalance, secondTokenBalance, buyAmount || 0, secondTokenId === 'TRX')

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
      firstTokenAbbr,
      firstTokenImage,
      secondTokenId,
      secondTokenAbbr,
      secondTokenBalance,
      price,
      secondTokenImage } = this.props.exchangeData

    const cost = estimatedBuyCost(firstTokenBalance, secondTokenBalance, buyAmount || 0, secondTokenId === 'TRX')
    const formattedCost = formatFloat(cost)

    const isTokenToToken = secondTokenId !== 'TRX' && firstTokenId !== 'TRX'
    const buyType = getInputType(firstTokenId)
    const estimatedType = getInputType(secondTokenId)

    const minBuy = Math.floor(cost / price)

    const firstToken = { name: firstTokenId, abbr: firstTokenAbbr, image: firstTokenImage }
    const secondToken = { name: secondTokenId, abbr: secondTokenAbbr, image: secondTokenImage }

    const firstTokenIdentifier = firstTokenAbbr || firstTokenId
    const secondTokenIdentifier = secondTokenAbbr || secondTokenId

    return (
      <ScrollWrapper>
        <Utils.View height={8} />
        <Utils.View paddingX='medium'>

          <ExchangeBalancePair
            firstToken={secondToken}
            secondToken={firstToken}
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
              rightContent={() => this._renderRightContent(firstTokenIdentifier)}
              placeholder='0'
              keyboardType='numeric'
              type={buyType}
              numbersOnly
              value={buyAmount}
            />
            {isTokenToToken &&
            <Utils.Text size='tiny' font='regular' align='right'>
              {tl.t('exchange.minToBuy', {min: minBuy, tokenId: firstTokenId})}
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
