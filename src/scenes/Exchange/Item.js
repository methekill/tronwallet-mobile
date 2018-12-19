import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { withNavigation } from 'react-navigation'

import { Colors } from '../../components/DesignSystem'
import { ExchangeRow, TinyTriangle, ExchangeLogo } from './elements'
import * as Utils from '../../components/Utils'
import FontelloIcon from '../../components/FontelloIcon'
import FontelloButton from '../../components/FontelloButton'

import SwipeItem from '../../components/SwipeIconItem'

class ExchangeItem extends Component {
  _onFavoritePress = () => {
    this.props.onFavoritePress(this.props.exchangeData.exchangeId)
    this.swipeItem.reset()
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

  _renderItem = () => {
    const { onItemPress } = this.props
    const {
      firstTokenId,
      firstTokenUserBalance,
      secondTokenId,
      firstTokenAbbr,
      secondTokenAbbr,
      firstTokenImage,
      variation,
      price,
      favorited } = this.props.exchangeData

    const icon = favorited ? 'star-fill' : '-mark,-highlight,-bookmark,-save'
    const firstTokenIdentifier = firstTokenAbbr || firstTokenId
    const secondTokenIdentifier = secondTokenAbbr || secondTokenId

    return (
      <ExchangeRow onPress={() => onItemPress(this.props.exchangeData)}>
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

        <Utils.View justify='center' style={{translateX: 6}}>
          <FontelloIcon
            name='arrow,-right,-right-arrow,-navigation-right,-arrows'
            color={Colors.greyBlue}
          />
        </Utils.View>
      </ExchangeRow>
    )
  }

  _renderOption = () => [
    <FontelloButton
      onPress={this._onFavoritePress}
      size={20}
      name={this.props.exchangeData.favorited ? 'star-fill' : '-mark,-highlight,-bookmark,-save'}
      color={Colors.lemonYellow}
    />
  ]

  render () {
    return (
      <SwipeItem
        ref={node => (this.swipeItem = node)}
        options={this._renderOption()}
        item={this._renderItem()}
      />
    )
  }
}

ExchangeItem.propTypes = {
  onItemPress: PropTypes.func.isRequired,
  onFavoritePress: PropTypes.func.isRequired,
  exchangeData: PropTypes.shape({
    firstTokenId: PropTypes.string,
    secondTokenId: PropTypes.string,
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
