import React from 'react'
import Carousel from 'react-native-snap-carousel'
import { Dimensions, Alert, Clipboard } from 'react-native'
import ActionSheet from 'react-native-actionsheet'
import Toast from 'react-native-easy-toast'
import get from 'lodash/get'
import MixPanel from 'react-native-mixpanel'

import Card from './Card'

import { withContext } from '../../../store/context'
import { hideSecret } from '../../../utils/secretsUtils'
import { logSentry } from '../../../utils/sentryUtils'
import tl from '../../../utils/i18n'

const CURRENCIES = [
  tl.t('cancel'),
  'TRX',
  'USD',
  'EUR',
  'AUD',
  'GBP',
  'BTC',
  'ETH',
  'BRL',
  'CAD',
  'CLP',
  'CNY',
  'CZK',
  'DKK',
  'HKD',
  'HUF',
  'INR',
  'IDR',
  'ILS',
  'JPY',
  'KRW',
  'MYR',
  'MXN',
  'NZD',
  'NOK',
  'PKR',
  'PHP',
  'PLN',
  'RUB',
  'SGD',
  'ZAR',
  'SEK',
  'CHF',
  'TWD',
  'THB',
  'TRY'
]

export class AccountsCarousel extends React.Component {
  get price () {
    const { price, currency } = this.props.context
    return get(price, [currency, 'price'], 0)
  }

  _snapToNewAccount = () => {
    const { accounts } = this.props.context
    const createdItemPosition = accounts.length - 1
    // We set the state to load before the item is focused
    // Timeout needed for android
    setTimeout(() => this.carousel.snapToItem(createdItemPosition), 300)
  }

  _onSnapToItem = activeAccount => {
    const { setPublicKey, accounts } = this.props.context
    if (accounts.length) {
      const { address, balance } = accounts[activeAccount]

      let prevAccountIndex = activeAccount - 1
      if (prevAccountIndex <= 0) {
        prevAccountIndex = 0
      }
      setPublicKey(address)
      const prevAccount = accounts[prevAccountIndex]
      MixPanel.trackWithProperties('Switch account', {
        'from.adress': prevAccount.address,
        'from.balance': prevAccount.balance || 0,
        'to.address': address,
        'to.balance': balance || 0
      })
    }
  }

  // expose current index to parent
  currentIndex = () => this.carousel.currentIndex

  _alertHideAccount = (address, balance) => {
    Alert.alert(tl.t('warning'), tl.t('hideAccount'), [
      { text: tl.t('cancel'), style: 'cancel' },
      { text: tl.t('remove'), onPress: () => this._handleHideAccount(address, balance) }
    ])
  }

  _handleHideAccount = async (address, balance) => {
    try {
      const { pin, hideAccount } = this.props.context
      await hideSecret(pin, address)
      this.carousel.snapToPrev()
      hideAccount(address)
      MixPanel.trackWithProperties('Hide Account', {
        address,
        balance
      })
    } catch (error) {
      logSentry(error, 'Hide Account Handler')
      Alert.alert(tl.t('warning'), tl.t('error.hideAccount'))
    }
  }

  _handleCurrencyChange = async index => {
    if (index) {
      const currency = CURRENCIES[index]
      const prevCurrency = this.props.context.currency
      this.props.context.setCurrency(currency)
      MixPanel.trackWithProperties('Change currency', { prevCurrency, currency })
    }
  }

  _onCopyAddress = async address => {
    try {
      await Clipboard.setString(address)
      this.refs.toast.show(tl.t('receive.clipboardCopied'))
      MixPanel.trackWithProperties('Copy to clipboard', { address, location: 'Balance Card' })
    } catch (error) {
      logSentry(error, 'Copy Address - Clipboard')
    }
  }

  _renderItem = ({ item, index }) => {
    if (!item) {
      return null
    }

    const { currency } = this.props.context

    const balance = item.balance || 0
    const tronPower = item.tronPower || 0
    const bandwidth = item.bandwidth || 0
    return (
      <Card
        name={item.name}
        address={item.address}
        price={this.price}
        balance={balance}
        tronPower={tronPower}
        bandwidth={bandwidth}
        currency={currency}
        showDeleteBtn={index !== 0}
        onCopy={this._onCopyAddress}
        onCurrencyPress={() => this.ActionSheet.show()}
        onDelete={this._alertHideAccount}
      />
    )
  }

  render () {
    const { accounts } = this.props.context
    return (
      !!accounts && (
        <React.Fragment>
          <Carousel
            ref={ref => {
              this.carousel = ref
            }}
            layout='default'
            enableMomentum
            decelerationRate={0.9}
            data={accounts}
            itemWidth={300}
            sliderWidth={Dimensions.get('window').width}
            slideStyle={{ paddingHorizontal: 6 }}
            renderItem={this._renderItem}
            onSnapToItem={this._onSnapToItem}
          />
          <ActionSheet
            ref={ref => {
              this.ActionSheet = ref
            }}
            title={tl.t('balance.chooseCurrency')}
            options={CURRENCIES}
            cancelButtonIndex={0}
            onPress={this._handleCurrencyChange}
          />
          <Toast
            ref='toast'
            position='center'
            fadeInDuration={750}
            fadeOutDuration={1000}
            opacity={0.8}
          />
        </React.Fragment>
      )
    )
  }
}

export default withContext(AccountsCarousel)
