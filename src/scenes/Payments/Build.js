import React, { Component } from 'react'
import { ActivityIndicator, Alert, ScrollView } from 'react-native'
import axios from 'axios'
import MixPanel from 'react-native-mixpanel'
import Config from 'react-native-config'

// Design
import { Colors } from '../../components/DesignSystem'
import * as Utils from '../../components/Utils'
import KeyboardScreen from '../../components/KeyboardScreen'
import Input from '../../components/Input'
import ButtonGradient from '../../components/ButtonGradient'
import RequestModal from './RequestModal'
import SelectorTile from '../../components/SelectorTile'

// Utils
import tl from '../../utils/i18n'
import { withContext } from '../../store/context'
import { formatNumber } from '../../utils/numberUtils'
import { logSentry } from '../../utils/sentryUtils'
import onBackgroundHandler from '../../utils/onBackgroundHandler'

const SELECTOR_OPTIONS = [
  {label: 'USD', value: 'USD'},
  {label: 'EUR', value: 'EUR'},
  {label: 'TRX', value: 'TRX'}
]

class RequestPayment extends Component {
  state = {
    amount: '',
    amountTrx: '0',
    description: '',
    tokenName: 'TRX',
    tokenId: '1',
    currencySelected: 'USD',
    currencyPrices: {
      'USD': '1',
      'EUR': '1',
      'TRX': '1'
    },
    modalQRVisible: false,
    loading: true
  }

  componentDidMount () {
    this._loadData()
    this.appStateListener = onBackgroundHandler(this._handleAppStateChange)
  }

  componentWillUnmount () {
    this.appStateListener.remove()
  }

  _handleAppStateChange = (nextAppState) => {
    if (nextAppState.match(/background/)) {
      this.setState({ modalQRVisible: false })
    }
  }

  _loadData = async () => {
    try {
      const { data } = await axios.get(`${Config.TRONWALLET_DB}/prices?currency=USD,EUR`)
      const [usdData, eurData] = data

      const newCurrencyPrices = { ...this.state.currencyPrices }
      newCurrencyPrices['USD'] = formatNumber(usdData.price)
      newCurrencyPrices['EUR'] = formatNumber(eurData.price)

      this.setState({ currencyPrices: newCurrencyPrices })
      const currencyAccount = this.props.context.getCurrentAccount()
      if (currencyAccount) {
        const { amount, tokenName, tokenId, currencySelected } = this.state
        MixPanel.trackWithProperties('Build Payment', {
          'account.address': currencyAccount.address,
          'account.balance': currencyAccount.balance || 0,
          currencySelected,
          usd: newCurrencyPrices['USD'],
          eur: newCurrencyPrices['EUR'],
          amount,
          tokenId,
          tokenName
        })
      }
    } catch (err) {
      Alert.alert(tl.t('warning'), tl.t('buildPayment.error.currency'))
      logSentry(err, 'Build Payment')
    } finally {
      this.setState({loading: false})
    }
  }

  _checkRequestData = () => {
    const { amount, amountTrx } = this.state
    if (!amount || !amountTrx || Number(amount) <= 0 || Number(amountTrx) <= 0) {
      this.amount.focus()
    } else {
      this.setState({ modalQRVisible: true })
    }
  }

  _changeInput = (text, field) => {
    const { currencySelected, currencyPrices } = this.state
    if (field === 'amount') {
      const amountTrx = (text / currencyPrices[currencySelected]).toFixed(6)
      this.setState({ [field]: text, amountTrx })
    } else {
      this.setState({ [field]: text })
    }
  }

  _changeCurrency = (newCurrency) => {
    const { amount, currencyPrices } = this.state
    const amountTrx = (amount / currencyPrices[newCurrency]).toFixed(6)
    this.setState({ amountTrx, currencySelected: newCurrency })
  }

  _buildQrData = () => {
    const { amountTrx, tokenName, tokenId, description } = this.state
    const address = this.props.context.publicKey

    return JSON.stringify({amount: amountTrx, data: description, tokenName, tokenId, address})
  }

  _renderInputCurreny = () => (
    <Utils.Text size='smaller' secondary>
      {this.state.currencySelected}
    </Utils.Text>
  )

  render () {
    const {
      loading,
      amount,
      amountTrx,
      modalQRVisible,
      description,
      currencySelected
    } = this.state
    return (
      <KeyboardScreen>
        <ScrollView>
          <Utils.StatusBar />
          <Utils.Content>
            <Utils.Text marginBottom={15} size={'tiny'} align='center' secondary>{tl.t('buildPayment.selectCurrency')}</Utils.Text>
            <SelectorTile
              options={SELECTOR_OPTIONS}
              onItemPress={this._changeCurrency}
              itemSelected={currencySelected}
            />
            <Utils.VerticalSpacer />
            <Input
              innerRef={(input) => { this.amount = input }}
              label={tl.t('send.input.amount')}
              keyboardType='numeric'
              value={amount}
              editable={!loading}
              placeholder='0'
              onChangeText={text => this._changeInput(text, 'amount')}
              onSubmitEditing={() => this.description.focus()}
              rightContent={this._renderInputCurreny}
              align='right'
              type='float'
              numbersOnly
            />
            <Input
              innerRef={(input) => { this.description = input }}
              label={tl.t('send.input.description')}
              keyboardType='default'
              value={description}
              onChangeText={text => this._changeInput(text, 'description')}
            />
            <Utils.VerticalSpacer size='large' />
            {loading
              ? (<ActivityIndicator size='small' color={Colors.primaryText} />)
              : (
                <ButtonGradient
                  font='bold'
                  text={tl.t('buildPayment.generate')}
                  onPress={this._checkRequestData}
                />
              )}
          </Utils.Content>
          <RequestModal
            visible={modalQRVisible}
            onClose={() => this.setState({ modalQRVisible: false })}
            amount={amount}
            amountTrx={amountTrx}
            currency={currencySelected}
            qrData={this._buildQrData()}
          />
        </ScrollView>
      </KeyboardScreen>
    )
  }
}

export default withContext(RequestPayment)
