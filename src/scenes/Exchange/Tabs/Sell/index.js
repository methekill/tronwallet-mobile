import React, { Component } from 'react'
import { Alert, Vibration } from 'react-native'
import RNTron from 'react-native-tron'
import MixPanel from 'react-native-mixpanel'
import PropTypes from 'prop-types'

// Design
import Input from '../../../../components/Input'
import * as Utils from '../../../../components/Utils'
import { ExchangePair, ExchangeVariation, ScrollWrapper, PERCENTAGE_OPTIONS } from '../../elements'
import ExchangeBalancePair from '../BalancePair'
import ExchangeButton from '../Button'
import { Colors } from '../../../../components/DesignSystem'
import PercentageSelector from '../../../../components/SelectorTile'
import ExchangeTransactions from '../Transactions'

// Utils
import tl from '../../../../utils/i18n'
import { estimatedSellCost, trxValueParse, HIGH_VARIATION, getInputType } from '../../../../utils/exchangeUtils'
import { formatFloat } from '../../../../utils/numberUtils'
import { logSentry } from '../../../../utils/sentryUtils'

// Service
import WalletClient from '../../../../services/client'

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
    const { getCurrentBalances } = context
    const { firstTokenBalance, secondTokenBalance, firstTokenId, firstTokenName, secondTokenId, secondTokenName } = exchangeData

    if (sellAmount <= 0 || !sellAmount) {
      this.sellAmount.focus()
      return
    }
    const expecRev = estimatedRevenue || estimatedSellCost(firstTokenBalance, secondTokenBalance, sellAmount, secondTokenId === '_')

    if ((firstTokenId !== '_' && parseInt(sellAmount) !== Number(sellAmount)) ||
        (secondTokenId !== '_' && parseInt(expecRev) !== Number(expecRev))) {
      Alert.alert(tl.t('warning'), `Can only trade whole Assets amount`)
      return
    }

    if (expecRev <= 0) {
      Alert.alert(tl.t('warning'), `Can't trade ${estimatedRevenue} ${secondTokenName}`)
      this.sellAmount.focus()
      return
    }

    const firstBalanceId = firstTokenId === '_' ? '1' : firstTokenId
    const { balance: userFirstTokenBalance } =
    getCurrentBalances().find(bl => bl.id === firstBalanceId) || { balance: 0 }

    if (userFirstTokenBalance <= 0 || userFirstTokenBalance < sellAmount) {
      Alert.alert(tl.t('warning'), `You don't have enough ${firstTokenName} to sell`)
      return
    }

    if (askPinEx) {
      this.props.navigation.navigate('Pin', {
        shouldGoBack: true,
        testInput: pin => pin === this.props.context.pin,
        onSuccess: () => {
          const { publicKey } = this.props.context
          MixPanel.trackWithProperties('Pin Validation', {
            type: 'Sell',
            sellAmount,
            estimatedRevenue,
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
    const { sellAmount, estimatedRevenue } = this.state
    const { exchangeId, firstTokenId, secondTokenId, firstTokenBalance, secondTokenBalance } = this.props.exchangeData
    const { publicKey, accounts, loadUserData } = this.props.context

    const quant = trxValueParse(sellAmount, firstTokenId === '_')

    const expected = estimatedRevenue
      ? trxValueParse(estimatedRevenue, secondTokenId === '_')
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
    const { getCurrentBalances } = this.props.context
    const { firstTokenId } = this.props.exchangeData

    const firstBalanceId = firstTokenId === '_' ? '1' : firstTokenId
    const { balance } = getCurrentBalances().find(bl => bl.id === firstBalanceId) || { balance: 0 }

    const amountWanted = balance * percentage
    const sellAmount = firstTokenId === '_' ? amountWanted * HIGH_VARIATION : Math.floor(amountWanted)

    this._changeSellAmount(sellAmount)
  }

  _changeSellAmount = sellAmount => {
    const {
      firstTokenBalance,
      secondTokenId,
      secondTokenBalance
    } = this.props.exchangeData
    const estimatedRevenue = estimatedSellCost(firstTokenBalance, secondTokenBalance, sellAmount || 0, secondTokenId === '_')

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
      firstTokenId,
      firstTokenBalance,
      firstTokenName,
      firstTokenAbbr,
      firstTokenImage,
      secondTokenId,
      secondTokenName,
      secondTokenAbbr,
      secondTokenBalance,
      price,
      secondTokenImage
    } = this.props.exchangeData

    const cost = estimatedSellCost(firstTokenBalance, secondTokenBalance, sellAmount || 0, secondTokenName === '_')
    const formattedCost = formatFloat(cost)

    const isTokenToToken = firstTokenId !== '_' && secondTokenId !== '_'
    const sellType = getInputType(firstTokenId)
    const estimatedType = getInputType(secondTokenId)

    const minToSell = Math.round((1 / price) * 1.05) /* Used in Token To Token transaction, it needs to have a hihger variation when selling */

    const firstTokenAlias = { name: firstTokenName, abbr: firstTokenAbbr, image: firstTokenImage, id: firstTokenId }
    const secondTokenAlias = { name: secondTokenName, abbr: secondTokenAbbr, image: secondTokenImage, id: secondTokenId }

    const firstTokenIdentifier = firstTokenAbbr || firstTokenName
    const secondTokenIdentifier = secondTokenAbbr || secondTokenName

    return (
      <ScrollWrapper>
        <Utils.View height={8} />
        <Utils.View paddingX='medium'>

          <ExchangeBalancePair
            firstToken={firstTokenAlias}
            secondToken={secondTokenAlias}
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
              label={tl.t('sell').toUpperCase()}
              innerRef={input => { this.sellAmount = input }}
              onChangeText={this._changeSellAmount}
              rightContent={() => this._renderRightContent(firstTokenIdentifier)}
              placeholder='0'
              keyboardType='numeric'
              type={sellType}
              numbersOnly
              value={sellAmount}
            />
            {isTokenToToken &&
              <Utils.Text size='tiny' font='regular' align='right'>
                {tl.t('exchange.minToSell', {min: minToSell, tokenId: firstTokenName})}
              </Utils.Text>}
            <Input
              label={tl.t('exchange.estimatedRevenue')}
              rightContent={() => this._renderRightContent(secondTokenIdentifier)}
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

SellScene.propTypes = {
  exchangeData: PropTypes.object.isRequired
}

export default SellScene
