import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Motion, spring } from 'react-motion'
import { withContext } from '../../store/context'

import FadeIn from '../../components/Animations/FadeIn'
import Badge from '../../components/Badge'
import * as Utils from '../../components/Utils'
import { formatNumber } from '../../utils/numberUtils'

class TrxValue extends Component {
  _balanceTextSize = balance => formatNumber(balance).length > 10 ? 'medium' : 'large'

  render () {
    const { trxBalance } = this.props
    const { currency, price } = this.props.context
    return (
      <React.Fragment>
        <Utils.Row justify='flex-start' align='center'>
          {!!price[currency] && (
            <FadeIn name='usd-value'>
              <Motion
                defaultStyle={{ price: 0 }}
                style={{ price: spring(trxBalance) }}
              >
                {value => (
                  <Utils.View maxWidth={190}>
                    <Utils.Text size='large' adjustsFontSizeToFit numberOfLines={1}>
                      {formatNumber(value.price, currency)}
                    </Utils.Text>
                  </Utils.View>
                )}
              </Motion>
            </FadeIn>
          )}
          <Utils.HorizontalSpacer />
          <Badge bg='#191a2b' guarantee>{currency}</Badge>
        </Utils.Row>
        <Utils.VerticalSpacer />
      </React.Fragment>
    )
  }
}

TrxValue.propTypes = {
  trxBalance: PropTypes.number
}

export default withContext(TrxValue)
