import React from 'react'
import Carousel from 'react-native-snap-carousel'
import LinearGradient from 'react-native-linear-gradient'
import {
  TouchableOpacity,
  Dimensions,
  Alert,
  Clipboard,
  StyleSheet
} from 'react-native'
import ActionSheet from 'react-native-actionsheet'
import Toast from 'react-native-easy-toast'
import get from 'lodash/get'

import { withContext } from '../../../store/context'
import { Colors } from '../../../components/DesignSystem'

import TrxValue from '../TrxValue'
import * as Utils from '../../../components/Utils'
import {
  CarouselCard,
  CardInfo,
  CardFooter,
  TronLogo,
  Icon,
  BtnTrash,
  Label,
  Value
} from './elements'

import { hideSecret } from '../../../utils/secretsUtils'
import { logSentry } from '../../../utils/sentryUtils'
import { shortNumberFormat } from './../../../utils/numberUtils'
import tl from '../../../utils/i18n'

const CURRENCIES = [
  tl.t('cancel'),
  'TRX',
  'USD',
  'EUR',
  'AUD',
  'GBP',
  'BTC',
  'ETH'
]

class AccountsCarousel extends React.Component {
  get price () {
    const { price, currency } = this.props.context
    return get(price, [currency, 'price'], 0)
  }

  _snapToNewAccount = () => {
    const { accounts } = this.props.context
    const createdItemPosition = accounts.length - 1
    // We set the state to load before the item is focused
    this._onSnapToItem(createdItemPosition)
    // Timeout needed for android
    setTimeout(() => this.carousel.snapToItem(createdItemPosition), 300)
  }

  _onSnapToItem = activeAccount => {
    const { setPublicKey, accounts } = this.props.context
    if (accounts.length) {
      const { address } = accounts[activeAccount]
      setPublicKey(address)
    }
  }

  // expose current index to parent
  currentIndex = () => this.carousel.currentIndex

  _alertHideAccount = address => {
    Alert.alert(tl.t('warning'), tl.t('hideAccount'), [
      { text: tl.t('cancel'), style: 'cancel' },
      { text: 'Remove', onPress: () => this._handleHideAccount(address) }
    ])
  }

  _handleHideAccount = async address => {
    try {
      const { pin, hideAccount } = this.props.context
      const nextAccountIndex = this.currentIndex() - 1
      await hideSecret(pin, address)
      this.carousel.snapToItem(nextAccountIndex)
      hideAccount(address)
    } catch (error) {
      logSentry(error, 'Hide Account Handler')
      Alert.alert(tl.t('warning'), tl.t('error.hideAccount'))
    }
  }

  _handleCurrencyChange = async index => {
    if (index) {
      const currency = CURRENCIES[index]
      this.props.context.setCurrency(currency)
    }
  }

  _onCopyAddress = async address => {
    try {
      await Clipboard.setString(address)
      this.refs.toast.show(tl.t('receive.clipboardCopied'))
    } catch (error) {
      logSentry(error, 'Copy Address - Clipboard')
    }
  }

  _formatAddress = address =>
    address
      .substring(0, 9)
      .concat('...')
      .concat(address.substring(25, address.length))

  _renderItem = ({ item, index }) => {
    const { currency } = this.props.context
    const balance = get(item, 'balance', 0)
    const tronPower = get(item, 'tronPower', 0)
    const bandwidth = get(item, 'bandwidth', 0)
    const avaliable = shortNumberFormat(balance * this.price)
    const frozen = shortNumberFormat(tronPower * this.price)
    return (
      <CarouselCard>
        <LinearGradient
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          colors={[Colors.buttonGradient[0], Colors.buttonGradient[1]]}
          style={styles.linearCard}
        />
        <LinearGradient
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 0 }}
          colors={['rgb(48, 50, 76)', 'rgb(38, 40, 64)']}
          style={styles.linearCardBody}
        >
          <React.Fragment>
            <Utils.View padding={22} width='100%'>
              <Utils.Text color='#9b9cb9'>{item.name}</Utils.Text>
              <TronLogo>
                <Icon source={require('../../../assets/tron-logo-small.png')} />
              </TronLogo>
              <Utils.VerticalSpacer />

              <TouchableOpacity
                onPress={() => this._onCopyAddress(item.address)}
              >
                <Utils.Text color='white' size='smaller' font='regular'>
                  {this._formatAddress(item.address)}
                </Utils.Text>
              </TouchableOpacity>

              <Utils.VerticalSpacer size='small' />
              <TouchableOpacity onPress={() => this.ActionSheet.show()}>
                <TrxValue trxBalance={balance} currency={currency} />
              </TouchableOpacity>

              <Utils.VerticalSpacer size='small' />
              <Utils.Row justify='space-between'>
                <CardInfo
                  label={tl.t('avaliable')}
                  value={avaliable}
                  currency={currency}
                />
                <CardInfo
                  label={tl.t('frozen')}
                  value={frozen}
                  currency={currency}
                />
              </Utils.Row>
            </Utils.View>

            <CardFooter>
              <Utils.Column width='50%'>
                <Utils.Row>
                  <Utils.TWIcon
                    name='bandwidth'
                    size={16}
                    color={Colors.greyBlue}
                  />
                  <Label paddingLeft={10}>{tl.t('balance.bandwidth')}</Label>
                </Utils.Row>
              </Utils.Column>

              <Utils.Column width='50%' align='flex-end'>
                <Utils.Row justify='center' align='center'>
                  <Value paddingRight={10}>
                    {shortNumberFormat(bandwidth)}
                  </Value>
                  {index !== 0 && (
                    <BtnTrash
                      onPress={() => this._alertHideAccount(item.address)}
                    />
                  )}
                </Utils.Row>
              </Utils.Column>
            </CardFooter>
          </React.Fragment>
        </LinearGradient>
      </CarouselCard>
    )
  }

  render () {
    const { accounts } = this.props.context
    return (
      !!accounts && (
        <React.Fragment>
          <ActionSheet
            ref={ref => {
              this.ActionSheet = ref
            }}
            title={tl.t('balance.chooseCurrency')}
            options={CURRENCIES}
            cancelButtonIndex={0}
            onPress={this._handleCurrencyChange}
          />
          <Carousel
            ref={ref => {
              this.carousel = ref
            }}
            layout='default'
            onSnapToItem={this._onSnapToItem}
            enableMomentum
            decelerationRate={0.9}
            data={accounts}
            renderItem={this._renderItem}
            sliderWidth={Dimensions.get('window').width}
            itemWidth={300}
            slideStyle={{ paddingHorizontal: 6 }}
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

const styles = StyleSheet.create({
  linearCard: {
    height: 3,
    borderRadius: 6,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20
  },
  linearCardBody: {
    flex: 1,
    alignItems: 'flex-start',
    borderRadius: 6
  }
})

export default withContext(AccountsCarousel)
