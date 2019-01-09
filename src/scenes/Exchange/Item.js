import React, { Component } from 'react'
import { Alert } from 'react-native'
import PropTypes from 'prop-types'
import { withNavigation } from 'react-navigation'

import { Colors } from '../../components/DesignSystem'
import { ExchangeRow, TinyTriangle, ExchangeLogo } from './elements'
import * as Utils from '../../components/Utils'
import FontelloIcon from '../../components/FontelloIcon'

class ExchangeItem extends Component {
    _onLongPress = () => {
      // TO-DO Implement swipeable item
      Alert.alert(
        'Favorite an Exchange',
        `Do you want to ${this.props.exchangeData.favorited ? 'unpin' : 'pin'} this exchange ?`,
        [
          {text: 'Cancel', onPress: () => {}, style: 'cancel'},
          {text: 'OK', onPress: () => this.props.onFavoritePress(this.props.exchangeData.exchangeId)}
        ]
      )
    }
    _renderPercentageIndicator = variation => {
      if (!variation) return null

      const color = variation >= 0 ? Colors.weirdGreen : Colors.unconfirmed
      const triangle = variation >= 0
        ? { color: Colors.weirdGreen, direction: 'up' }
        : { color: Colors.unconfirmed, direction: 'down' }

      return (
        <Utils.Row align='center'>
          <Utils.Text size='xsmall' color={color}>{parseFloat(variation).toFixed(2)}%</Utils.Text>
          <Utils.View width={8} />
          <TinyTriangle direction={triangle.direction} color={triangle.color} />
        </Utils.Row>
      )
    }

    render () {
      const { onItemPress } = this.props
      const {
        firstTokenName,
        firstTokenUserBalance,
        secondTokenName,
        firstTokenAbbr,
        secondTokenAbbr,
        firstTokenImage,
        variation,
        price,
        favorited } = this.props.exchangeData

      const icon = favorited ? 'star-fill' : '-mark,-highlight,-bookmark,-save'
      const firstTokenIdentifier = firstTokenAbbr || firstTokenName
      const secondTokenIdentifier = secondTokenAbbr || secondTokenName

      return (
        <ExchangeRow onLongPress={this._onLongPress} onPress={() => onItemPress(this.props.exchangeData)}>
          <Utils.View>
            <ExchangeLogo source={firstTokenImage} />
            {favorited && <FontelloIcon
              size={16}
              name={icon}
              color={Colors.lemonYellow}
              style={{position: 'absolute', bottom: 0, right: 1}}
            />}
          </Utils.View>

          <Utils.View flex={1} paddingLeft='medium' justify='center'>
            <Utils.Row justify='space-between'>
              <Utils.Text size='small'>{firstTokenIdentifier} / {secondTokenIdentifier}</Utils.Text>
              <Utils.Text size='xsmall' color={Colors.greyBlue}>{price.toFixed(4)}</Utils.Text>
            </Utils.Row>
            <Utils.View height={8} />

            <Utils.Row justify='space-between'>
              <Utils.Text size='xsmall' color={Colors.greyBlue}>{firstTokenUserBalance}</Utils.Text>
              {this._renderPercentageIndicator(variation)}
            </Utils.Row>
          </Utils.View>
        </ExchangeRow>
      )
    }
}

ExchangeItem.propTypes = {
  onItemPress: PropTypes.func.isRequired,
  onFavoritePress: PropTypes.func.isRequired,
  exchangeData: PropTypes.shape({
    firstTokenId: PropTypes.string,
    firstTokenName: PropTypes.string,
    secondTokenId: PropTypes.string,
    secondTokenName: PropTypes.string,
    firstTokenAbbr: PropTypes.string,
    secondTokenAbbr: PropTypes.string,
    price: PropTypes.number,
    exchangeId: PropTypes.number,
    variation: PropTypes.oneOfType([null, PropTypes.number]),
    favorited: PropTypes.bool.isRequired,
    firstTokenImage: PropTypes.string,
    firstTokenUserBalance: PropTypes.string
  }).isRequired
}

export default withNavigation(ExchangeItem)
