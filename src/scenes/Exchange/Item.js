import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { withNavigation } from 'react-navigation'

import { Colors } from '../../components/DesignSystem'
import { ExchangeRow, TinyTriangle, ExchangeLogo } from './elements'
import * as Utils from '../../components/Utils'
import FontelloButton from '../../components/FontelloButton'

class ExchangeItem extends Component {
    _renderPercentageIndicator = variation => {
      if (!variation) return null

      const color = variation >= 0 ? Colors.weirdGreen : Colors.unconfirmed
      const triangle = variation >= 0
        ? { color: Colors.weirdGreen, direction: 'up' }
        : { color: Colors.unconfirmed, direction: 'down' }

      return (
        <Utils.Row align='center'>
          <Utils.Text size='xsmall' color={color}>{parseFloat(variation).toFixed(2)}%</Utils.Text>
          <Utils.View width={16} />
          <TinyTriangle direction={triangle.direction} color={triangle.color} />
        </Utils.Row>
      )
    }

    render () {
      const {
        onItemPress,
        onFavoritePress } = this.props
      const {
        exchangeId,
        firstTokenId,
        secondTokenId,
        firstTokenImage,
        variation,
        price,
        favorited } = this.props.exchangeData
      const icon = favorited ? 'star,-mark,-highlight,-bookmark,-save' : 'swipe-up,-hand-gesture,-top,-scroll-up,-move-up'
      const iconColor = favorited ? Colors.greyBlue : Colors.red
      return (
        <ExchangeRow onPress={() => onItemPress(this.props.exchangeData)}>
          <ExchangeLogo source={firstTokenImage} />
          <Utils.View flex={1} paddingLeft='medium' justify='center'>
            <Utils.Row justify='space-between'>
              <Utils.Text size='small'>{firstTokenId} / {secondTokenId}</Utils.Text>
              <FontelloButton
                size={18}
                name={icon}
                color={iconColor}
                onPress={() => onFavoritePress(exchangeId)}
                style={{translateX: 3}}
              />
            </Utils.Row>
            <Utils.View height={8} />
            <Utils.Row justify='space-between'>
              <Utils.Text size='xsmall' color={Colors.greyBlue}>{price.toFixed(8)}</Utils.Text>
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
    secondTokenId: PropTypes.string,
    firstTokenImage: PropTypes.string,
    price: PropTypes.number,
    exchangeId: PropTypes.number,
    variation: PropTypes.number,
    favorited: PropTypes.bool.isRequired
  }).isRequired
}

export default withNavigation(ExchangeItem)
