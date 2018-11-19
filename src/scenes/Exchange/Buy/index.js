import React, { Component } from 'react'
import {
  ScrollView
} from 'react-native'
import RNTron from 'react-native-tron'

// Design
import Input from '../../../components/Input'
import ButtonGradient from '../../../components/ButtonGradient'
import * as Utils from '../../../components/Utils'
import { Colors } from '../../../components/DesignSystem'
import { TradePair } from '../elements'
// Utils
import tl from '../../../utils/i18n'
import { withContext } from '../../../store/context'
import WalletClient from '../../../services/client'
import { estimatedBuyCost, expectedBuy } from '../../../utils/exchangeUtils'
import { formatFloat } from '../../../utils/numberUtils'

class SendScene extends Component {
  static navigationOptions = { header: null }

  state = {
    exData: {
      exchangeId: -1,
      creatorAddress: '',
      createTime: 0,
      firstTokenId: '',
      firstTokenBalance: 0,
      secondTokenId: '',
      secondTokenBalance: 0,
      available: false,
      price: 0
    },
    buyAmount: '',
    loading: false,
    step: 'Waiting'
  }

  componentDidMount () {
    const exData = this.props.navigation.getParam('exData', {})
    this.setState({exData})
  }

  _submit = () => {
    const { buyAmount } = this.state
    if (buyAmount <= 0 || !buyAmount) {
      this.buyAmount.focus()
      return
    }
    this._exchangeToken()
  }

  _exchangeToken = async () => {
    const { buyAmount } = this.state
    const { exchangeId, price, secondTokenId, firstTokenId } = this.state.exData
    const { publicKey, accounts, loadUserData } = this.props.context

    const quant = estimatedBuyCost(buyAmount, price, secondTokenId === 'TRX', true)
    const expected = expectedBuy(buyAmount, firstTokenId === 'TRX')

    this.setState({loading: true})
    try {
      const exParams = {
        address: publicKey,
        tokenId: secondTokenId,
        exchangeId,
        quant,
        expected
      }

      this.setState({step: 'Getting exchange Transaction'})
      const transactionUnsigned = await WalletClient.getExchangeTransaction(exParams)

      const userKey = accounts.find(acc => acc.address === publicKey).privateKey
      this.setState({step: 'Signing exchange'})
      const signedTransaction = await RNTron.signTransaction(userKey, transactionUnsigned)

      this.setState({step: 'Broadcasting'})
      const { code } = await WalletClient.broadcastTransaction(signedTransaction)

      if (code === 'SUCCESS') {
        this.setState({step: 'Success !'})
        loadUserData()
      } else {
        this.setState({step: 'Fail !'})
      }
    } catch (error) {
      this.setState({step: 'Fail !'})
      console.warn('Error while submiting', error)
    } finally {
      this.setState({loading: false})
    }
  }

  _renderCurrentBalance = () => {
    const { exData } = this.state
    const { balances, publicKey } = this.props.context
    const firstTokenBalance = balances[publicKey].find(bl => bl.name === exData.firstTokenId) || { balance: 0 }
    const secondTokenBalance = balances[publicKey].find(bl => bl.name === exData.secondTokenId) || { balance: 0 }
    return <Utils.View paddingX='large' justify='center' paddingY='medium'>
      <Utils.Row align='center' justify='space-around'>
        <Utils.View>
          <Utils.Text size='smaller' color={Colors.greyBlue}>{exData.firstTokenId}</Utils.Text>
          <Utils.Text size='smaller' color={Colors.greyBlue}>{firstTokenBalance.balance}</Utils.Text>
        </Utils.View>
        <Utils.View>
          <Utils.Text size='smaller' color={Colors.greyBlue}>{exData.secondTokenId}</Utils.Text>
          <Utils.Text size='smaller' color={Colors.greyBlue}>{secondTokenBalance.balance}</Utils.Text>
        </Utils.View>
      </Utils.Row>
    </Utils.View>
  }

  _renderRightContent = token =>
    <Utils.Text size='small' color={Colors.greyBlue}>
      {token}
    </Utils.Text>

  render () {
    const {
      exData,
      buyAmount,
      loading
    } = this.state
    const cost = estimatedBuyCost(exData.price, buyAmount || 0, exData.secondTokenId === 'TRX')
    const isTokenToken = exData.secondTokenId !== 'TRX' && exData.firstTokenId !== 'TRX'
    return (
      <Utils.SafeAreaView>
        <ScrollView>
          <TradePair
            text={`${exData.firstTokenId}/${exData.secondTokenId} = ${exData.price.toFixed(4)}`}
          />
          {this._renderCurrentBalance()}
          <Utils.View flex={1} justify='center' paddingX='medium' paddingY='small'>
            <Input
              label={tl.t('buy').toUpperCase()}
              innerRef={input => { this.buyAmount = input }}
              onChangeText={buyAmount => this.setState({buyAmount})}
              rightContent={() => this._renderRightContent(exData.firstTokenId)}
              placeholder='0'
              keyboardType='numeric'
              type='float'
              numbersOnly
              value={buyAmount}
            />
            {isTokenToken &&
            <Utils.Text padding={10} size='tiny' font='regular'>
             Valid trading value ≈ {Math.floor(cost / exData.price)} {exData.firstTokenId}
            </Utils.Text>}
            <Input
              label='ESTIMATED COST'
              rightContent={() => this._renderRightContent(exData.secondTokenId)}
              placeholder={formatFloat(cost)}
              editable={false}
            />
            <Utils.Text padding={20} font='regular' size='tiny' align='center'>
                Slightly increase the estimated cost, and the turnover rate will be higher.
            </Utils.Text>
            <ButtonGradient
              font='bold'
              text={tl.t('buy').toUpperCase()}
              onPress={this._submit}
              disabled={loading}
            />
            <Utils.Text padding={20} align='center' size='large' color={Colors.greyBlue}>
              {this.state.step}
            </Utils.Text>
          </Utils.View>
        </ScrollView>
      </Utils.SafeAreaView>
    )
  }
}

export default withContext(SendScene)
