import React, { Component } from 'react'
import { ScrollView, Alert } from 'react-native'
import RNTron from 'react-native-tron'
import MixPanel from 'react-native-mixpanel'

// Design
import Input from '../../../components/Input'
import * as Utils from '../../../components/Utils'
import { ExchangePair, ExchangeVariation } from '../elements'
import ExchangeBalancePair from '../ExchangeBalancePair'
import ExchangeButton from '../ExchangeButton'
import { Colors } from '../../../components/DesignSystem'

// Utils
import tl from '../../../utils/i18n'
import { withContext } from '../../../store/context'
import { estimatedSellCost, trxValueParse } from '../../../utils/exchangeUtils'
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
    const { balances, publicKey } = this.props.context
    const { firstTokenBalance, secondTokenBalance, firstTokenId, secondTokenId } = this.props.exchangeData

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

    this.props.navigation.navigate('Pin', {
      shouldGoBack: true,
      testInput: pin => pin === this.props.context.pin,
      onSuccess: this._exchangeToken
    })
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
        loadUserData()
      } else {
        this.setState({result: 'fail', loading: false})
      }
    } catch (error) {
      this.setState({result: 'fail', loading: false})
      logSentry(error, 'Selling Exchange')
    } finally {
      this.sellTimeout = setTimeout(() =>
        this.setState({
          sellAmount: '',
          estimatedRevenue: '',
          result: false
        }), 3200)
    }
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
    const minToSell = Math.round((1 / price) * 1.05)
    const isTokenToken = secondTokenId !== 'TRX' && firstTokenId !== 'TRX'
    return (
      <Utils.SafeAreaView>
        <ScrollView>
          <Utils.View height={24} />
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
          <Utils.View flex={1} justify='center' paddingX='medium' paddingY='small'>
            <Input
              label={tl.t('sell').toUpperCase()}
              innerRef={input => { this.sellAmount = input }}
              onChangeText={this._changeSellAmount}
              rightContent={() => this._renderRightContent(firstTokenId)}
              placeholder='0'
              keyboardType='numeric'
              type='float'
              numbersOnly
              value={sellAmount}
            />
            {isTokenToken &&
            <Utils.Text size='tiny' font='regular' align='right'>
              {tl.t('exchange.minToSell', {min: minToSell, tokenId: firstTokenId})}
            </Utils.Text>}
            <Input
              label={tl.t('exchange.estimatedRevenue')}
              rightContent={() => this._renderRightContent(secondTokenId)}
              onChangeText={estimatedRevenue => this.setState({estimatedRevenue})}
              placeholder={formatFloat(cost)}
              keyboardType='numeric'
              type='float'
              numbersOnly
              value={estimatedRevenue}
            />
            <ExchangeVariation text={tl.t('exchange.variation.sell')} />
            <ExchangeButton
              text={tl.t('sell').toUpperCase()}
              loading={loading}
              result={result}
              onSubmit={this._submit}
            />
          </Utils.View>
        </ScrollView>
      </Utils.SafeAreaView>
    )
  }
}

export default withContext(SellScene)
