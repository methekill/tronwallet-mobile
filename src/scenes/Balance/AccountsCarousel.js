import React from 'react'
import Carousel from 'react-native-snap-carousel'
import styled from 'styled-components'
// import LinearGradient from 'react-native-linear-gradient'
import { TouchableOpacity, Dimensions, View } from 'react-native'
import ActionSheet from 'react-native-actionsheet'

import { withContext } from '../../store/context'

import TrxValue from './TrxValue'
import Info from './Info'
import * as Utils from '../../components/Utils'
import tl from '../../utils/i18n'

const CarouselCard = styled(View)`
  border-radius: 4px;
  height: 200px;
  padding: 16px;
  background-color: #66688F60;
`

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

  _renderItem = ({ item }) => (
    <CarouselCard>
      <Utils.Text color='#66688F'>{item.name}</Utils.Text>
      <Utils.Text>{item.address}</Utils.Text>
      <Utils.VerticalSpacer size='medium' />
      <TouchableOpacity onPress={() => this.ActionSheet.show()}>
        <TrxValue trxBalance={item.balance || 0} />
      </TouchableOpacity>
      <Utils.Row justify='space-around'>
        <Info label='TRON POWER' value={item.tronPower || 0} />
        <Info label='BANDWIDTH' value={item.bandwidth || 0} />
      </Utils.Row>
    </CarouselCard>
  )

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
          itemWidth={280}
          loop
        />
      </React.Fragment>
    )
  }
}

export default withContext(AccountsCarousel)
