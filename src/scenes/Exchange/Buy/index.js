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
import WalletClient, { ONE_TRX } from '../../../services/client'
import { estimatedCost, tokenIdParser } from '../../../utils/exchangeUtils'

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

  _tokenParser = token => token === '_' ? 'TRX' : token.toUpperCase()

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
    const { exchangeId, price, secondTokenId } = this.state.exData
    const { publicKey, accounts } = this.props.context
    const expected = Math.round(buyAmount * price) || 1
    const quant = secondTokenId === '_'
      ? Math.floor(buyAmount * ONE_TRX * price * 1.01)
      : buyAmount

    this.setState({loading: true})
    try {
      const exParams = {
        address: publicKey,
        tokenId: secondTokenId,
        quant,
        expected,
        exchangeId
      }

      console.warn('....', exParams)
      this.setState({step: 'Getting exchange Transaction'})
      const transactionUnsigned = await WalletClient.getExchangeTransaction(exParams)

      const privateKey = accounts.find(acc => acc.address === publicKey).privateKey
      this.setState({step: 'Signing exchange'})
      const signedTransaction = await RNTron.signTransaction(privateKey, transactionUnsigned)
      this.setState({step: 'Broadcasting'})
      const { code } = await WalletClient.broadcastTransaction(signedTransaction)

      if (code === 'SUCCESS') {
        this.setState({step: 'Success !'})
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

  _renderRightContent = text =>
    <Utils.Text size='small' color={Colors.greyBlue}>
      {this._tokenParser(text)}
    </Utils.Text>

  render () {
    const {
      exData,
      buyAmount,
      loading
    } = this.state
    const cost = estimatedCost(exData.price, buyAmount || 0).toFixed(4)
    const estimatedFixedCost = estimatedCost(exData.price, 1).toFixed(4)
    return (
      <Utils.SafeAreaView>
        <ScrollView>
          <Utils.View align='center' justify='center'>
            <Utils.Text size='xsmall' color={Colors.greyBlue}>
              {tokenIdParser(exData.firstTokenId)}/{tokenIdParser(exData.secondTokenId)} = {estimatedFixedCost}
            </Utils.Text>
          </Utils.View>
          <Utils.View flex={1} justify='center' paddingX='medium' paddingY='medium'>
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
            <Input
              label='ESTIMATED COST'
              rightContent={() => this._renderRightContent(exData.secondTokenId)}
              placeholder={cost}
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
            <Utils.Text padding={20} align='center' size='large' color={Colors.greyBlue}>{this.state.step}</Utils.Text>
          </Utils.View>
        </ScrollView>
      </Utils.SafeAreaView>
    )
  }
}

export default withContext(SendScene)
