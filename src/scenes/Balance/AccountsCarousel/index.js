import React from 'react'
import Carousel from 'react-native-snap-carousel'
import LinearGradient from 'react-native-linear-gradient'
import { TouchableOpacity, Dimensions } from 'react-native'
import ActionSheet from 'react-native-actionsheet'

import { withContext } from '../../../store/context'

import TrxValue from '../TrxValue'
import * as Utils from '../../../components/Utils'
import {
  CarouselCard,
  TronLogo,
  Icon
} from './elements'
import tl from '../../../utils/i18n'
import { Colors } from '../../../components/DesignSystem'
import CardInfo from './CardInfo'

const CURRENCIES = [tl.t('cancel'), 'USD', 'EUR', 'BTC', 'ETH']

class AccountsCarousel extends React.Component {
  shouldComponentUpdate (nextProps) {
    const { accounts } = nextProps.context
    const { accounts: oldAccounts } = this.props.context
    for (let i = 0; i < accounts.length; i++) {
      if (!oldAccounts[i]) return true
      if (accounts[i].address !== oldAccounts[i].address) return true
      if (accounts[i].name !== oldAccounts[i].name) return true
      if (accounts[i].tronPower !== oldAccounts[i].tronPower) return true
      if (accounts[i].bandwidth !== oldAccounts[i].bandwidth) return true
      if (accounts[i].balance !== oldAccounts[i].balance) return true
    }
    return false
  }

  // expose current index to parent
  currentIndex = () => this.carousel.currentIndex

  _handleCurrencyChange = async (index) => {
    if (index) {
      const currency = CURRENCIES[index]
      this.props.context.setCurrency(currency)
    }
  }

  _renderItem = ({ item }) => {
    const { freeze, publicKey, currency } = this.props.context

    return (
      <CarouselCard>
        {this.props.context.publicKey === item.address && (
          <LinearGradient
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            colors={[Colors.buttonGradient[0], Colors.buttonGradient[1]]}
            style={{
              height: 3,
              borderRadius: 6,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20
            }}
          />
        )}
        <LinearGradient
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          colors={['#2b2d44', '#1f2034']}
          style={{
            flex: 1,
            padding: 22,
            alignItems: 'flex-start',
            borderRadius: 6
          }}
        >
          {this.props.context.publicKey === item.address && (
            <React.Fragment>
              <TronLogo>
                <Icon source={require('../../../assets/tron-logo-small.png')} />
              </TronLogo>
              <Utils.Text color='#9b9cb9'>{item.name}</Utils.Text>
              <Utils.VerticalSpacer size='medium' />
              {(item.balance !== undefined && currency) && (
                <TouchableOpacity onPress={() => this.ActionSheet.show()}>
                  <TrxValue trxBalance={item.balance} currency={currency} />
                </TouchableOpacity>
              )}
              <Utils.VerticalSpacer size='medium' />
              {(!!freeze[publicKey]) && (
                <Utils.Row>
                  <CardInfo label={tl.t('tronPower')} value={item.tronPower} />
                  <Utils.HorizontalSpacer size='medium' />
                  <CardInfo label={tl.t('balance.bandwidth')} value={item.bandwidth} />
                </Utils.Row>
              )}
            </React.Fragment>
          )}
        </LinearGradient>
      </CarouselCard>
    )
  }

  render () {
    const { accounts } = this.props.context
    return !!accounts && (
      <React.Fragment>
        <ActionSheet
          ref={ref => { this.ActionSheet = ref }}
          title={tl.t('balance.chooseCurrency')}
          options={CURRENCIES}
          cancelButtonIndex={0}
          onPress={this._handleCurrencyChange}
        />
        <Carousel
          ref={ref => { this.carousel = ref }}
          layout='default'
          onSnapToItem={this.props.onSnapToItem}
          data={accounts}
          renderItem={this._renderItem}
          sliderWidth={Dimensions.get('window').width}
          itemWidth={300}
          loop
          slideStyle={{paddingHorizontal: 6}}
        />
      </React.Fragment>
    )
  }
}

export default withContext(AccountsCarousel)
