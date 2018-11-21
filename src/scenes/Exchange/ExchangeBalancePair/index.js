import React, { Component } from 'react'
import { Image } from 'react-native'
import { Motion, spring } from 'react-motion'
import PropTypes from 'prop-types'

import { Colors, Spacing } from '../../../components/DesignSystem'
import * as Utils from '../../../components/Utils'
import { formatNumber } from '../../../utils/numberUtils'
import { withContext } from '../../../store/context'

class ExchangeBalancePair extends Component {
  render () {
    const { balances, publicKey } = this.props.context
    const { firstToken, secondToken } = this.props
    const {balance: firstTokenBalance} = balances[publicKey].find(bl => bl.name === firstToken) || { balance: 0 }
    const {balance: secondTokenBalance} = balances[publicKey].find(bl => bl.name === secondToken) || { balance: 0 }

    return <Utils.View marginX={Spacing.large} paddingY='small'>
      <Utils.Row align='center'>
        <Utils.View flex={0.33} align='center' justify='center'>
          <Utils.Text size='small'>{firstToken}</Utils.Text>
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
            source={require('../../../assets/arrow-right-gradient.png')}
            style={{height: 12, width: 20}}
          />
        </Utils.View>
        <Utils.View flex={0.33} justify='center' align='center'>
          <Utils.Text size='small'>{secondToken}</Utils.Text>
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
    </Utils.View>
  }
}
ExchangeBalancePair.propTypes = {
  firstToken: PropTypes.string.isRequired,
  secondToken: PropTypes.string.isRequired
}
ExchangeBalancePair.defaultProps = {
  firstToken: '',
  secondToken: ''
}
export default withContext(ExchangeBalancePair)
