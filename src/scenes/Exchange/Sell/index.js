import React, { Component } from 'react'
import {
  ScrollView
} from 'react-native'
import RNTron from 'react-native-tron'

// Design
import Input from '../../../components/Input'
import ButtonGradient from '../../../components/ButtonGradient'
import * as Utils from '../../../components/Utils'

// Utils
import tl from '../../../utils/i18n'
import { Colors } from '../../../components/DesignSystem'
import { withContext } from '../../../store/context'
import WalletClient from '../../../services/client'
import { estimatedSellCost, expectedSell } from '../../../utils/exchangeUtils'
import { formatFloat } from '../../../utils/numberUtils'

class SendScene extends Component {
  static navigationOptions = { header: null }

  state = {
    exData: { exchangeId: -1,
      creatorAddress: '',
      createTime: 0,
      firstTokenId: '',
      firstTokenBalance: 0,
      secondTokenId: '',
      secondTokenBalance: 0,
      available: false,
      price: 0
    },
    sellAmount: '',
    loading: false,
    step: 'Waiting'
  }

  componentDidMount () {
    const exData = this.props.navigation.getParam('exData', {})
    this.setState({exData})
  }

  _submit = () => {
    const { sellAmount } = this.state
    if (sellAmount <= 0 || !sellAmount) {
      this.sellAmount.focus()
      return
    }
    this._exchangeToken()
  }

  _exchangeToken = async () => {
    const { sellAmount } = this.state
    const { exchangeId, price, firstTokenId, secondTokenId } = this.state.exData
    const { publicKey, accounts, loadUserData } = this.props.context

    const quant = expectedSell(sellAmount, firstTokenId === 'TRX')
    const expected = estimatedSellCost(price, sellAmount, secondTokenId === 'TRX', true)

    this.setState({loading: true})
    try {
      const exParams = {
        address: publicKey,
        tokenId: firstTokenId,
        quant,
        exchangeId,
        expected
      }

      this.setState({step: 'Waiting..'})
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
      console.warn('Error while submiting', error.message)
    } finally {
      this.setState({loading: false})
    }
  }

  _renderCurrentBalance = () => {
    const { exData } = this.state
    const { balances, publicKey } = this.props.context
    const firstTokenBalance = balances[publicKey].find(bl => bl.name === exData.firstTokenId) || { balance: 0 }
    const secondTokenBalance = balances[publicKey].find(bl => bl.name === exData.secondTokenId) || { balance: 0 }
    return <Utils.View paddingX='large' justify='center' paddingY='small'>
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
  _renderRightContent = text =>
    <Utils.Text size='small' color={Colors.greyBlue}>
      {text}
    </Utils.Text>

  render () {
    const {
      exData,
      sellAmount,
      loading
    } = this.state
    const cost = estimatedSellCost(exData.price, sellAmount || 0, exData.secondTokenId === 'TRX')
    return (
      <Utils.SafeAreaView>
        <ScrollView>
          <Utils.View align='center' justify='center'>
            <Utils.Text size='xsmall' color={Colors.greyBlue}>
              {exData.firstTokenId}/{exData.secondTokenId} = {exData.price.toFixed(4)}
            </Utils.Text>
          </Utils.View>
          <Utils.View align='center' justify='center'>
            <Utils.Text size='tiny' color={Colors.greyBlue}>
              Min to sell {Math.ceil(1 / exData.price)}
            </Utils.Text>
          </Utils.View>
          {this._renderCurrentBalance()}
          <Utils.View flex={1} justify='center' paddingX='medium' paddingY='medium'>
            <Input
              label={tl.t('sell').toUpperCase()}
              innerRef={input => { this.sellAmount = input }}
              onChangeText={sellAmount => this.setState({sellAmount})}
              rightContent={() => this._renderRightContent(exData.firstTokenId)}
              placeholder='0'
              keyboardType='numeric'
              type='float'
              numbersOnly
              value={sellAmount}
            />
            <Input
              label='ESTIMATED COST'
              rightContent={() => this._renderRightContent(exData.secondTokenId)}
              placeholder={formatFloat(cost)}
              editable={false}
            />
            <Utils.Text padding={20} font='regular' size='tiny' align='center'>
                Slightly lower the estimated cost, and the turnover rate will be higher.
            </Utils.Text>
            <ButtonGradient
              font='bold'
              text={tl.t('sell').toUpperCase()}
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
