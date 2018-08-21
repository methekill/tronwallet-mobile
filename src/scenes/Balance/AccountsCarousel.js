import React from 'react'
import Carousel from 'react-native-snap-carousel'
import styled from 'styled-components'
// import LinearGradient from 'react-native-linear-gradient'
import { TouchableOpacity, Dimensions, View } from 'react-native'
import ActionSheet from 'react-native-actionsheet'

import { withContext } from '../../store/context'

import TrxValue from './TrxValue'
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
      {(item.balance !== undefined) && (
        <TouchableOpacity onPress={() => this.ActionSheet.show()}>
          <TrxValue trxBalance={item.balance} currency={this.props.context.currency} />
        </TouchableOpacity>
      )}
    </CarouselCard>
  )

  render () {
    return !!this.props.accounts && (
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
          data={this.props.accounts}
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
