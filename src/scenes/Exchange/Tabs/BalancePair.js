import React, { Component } from 'react'
import { Image } from 'react-native'
import { Motion, spring } from 'react-motion'
import PropTypes from 'prop-types'

import { Colors } from '../../../components/DesignSystem'
import * as Utils from '../../../components/Utils'

import { withContext } from '../../../store/context'
import { formatNumber } from '../../../utils/numberUtils'

const ARROW_GRADIENT = require('../../../assets/arrow-right-gradient.png')

class ExchangeBalancePair extends Component {
  _findTokenBalance = tokenId => {
    const { getCurrentBalances } = this.props.context
    const currentBalances = getCurrentBalances()
    if (currentBalances.length) {
      const tokenIdParse = tokenId === '_' ? '1' : tokenId
      const { balance: tokenBalance } = currentBalances.find(bl => bl.id === tokenIdParse) || { balance: 0 }
      return tokenBalance
    }
    return { balance: 0 }
  }

  render () {
    const { firstToken, secondToken } = this.props

    const firstTokenBalance = this._findTokenBalance(firstToken.id)
    const secondTokenBalance = this._findTokenBalance(secondToken.id)

    const firstTokenIdentifier = firstToken.abbr || firstToken.name
    const secondTokenIdentifier = secondToken.abbr || secondToken.name

    return (<Utils.View paddingY='small'>
      <Utils.Row align='center'>
        <Utils.View flex={0.33} align='center' justify='center'>
          <Utils.Text marginTop='small' size='small'>{firstTokenIdentifier}</Utils.Text>
          <Motion
            defaultStyle={{ firstBalance: 0 }}
            style={{firstBalance: spring(firstTokenBalance)}}>
            {value =>
              <Utils.Text size='xsmall' color={Colors.greyBlue}>
                {formatNumber(value.firstBalance)}
              </Utils.Text>
            }
          </Motion>
        </Utils.View>
        <Utils.View flex={0.33} align='center' justify='center'>
          <Image
            source={ARROW_GRADIENT}
            style={{height: 12, width: 20}}
          />
        </Utils.View>
        <Utils.View flex={0.33} justify='center' align='center'>
          <Utils.Text marginTop='small' size='small'>{secondTokenIdentifier}</Utils.Text>
          <Motion
            defaultStyle={{ secondBalance: 0 }}
            style={{secondBalance: spring(secondTokenBalance)}}>
            {value =>
              <Utils.Text size='xsmall' color={Colors.greyBlue}>
                {formatNumber(value.secondBalance)}
              </Utils.Text>
            }
          </Motion>
        </Utils.View>
      </Utils.Row>
    </Utils.View>)
  }
}

ExchangeBalancePair.propTypes = {
  firstToken: PropTypes.shape({
    name: PropTypes.string,
    abbr: PropTypes.oneOfType([null, PropTypes.string]),
    image: PropTypes.oneOfType([null, PropTypes.string])
  }).isRequired,
  secondToken: PropTypes.shape({
    name: PropTypes.string,
    abbr: PropTypes.oneOfType([null, PropTypes.string]),
    image: PropTypes.oneOfType([null, PropTypes.string])
  }).isRequired
}

ExchangeBalancePair.defaultProps = {
  firstToken: {
    name: '',
    abbr: '',
    image: '',
    id: ''
  },
  secondToken: {
    name: '',
    abbr: '',
    image: '',
    id: ''
  }
}
export default withContext(ExchangeBalancePair)
