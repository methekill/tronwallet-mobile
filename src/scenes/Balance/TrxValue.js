import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Motion, spring } from 'react-motion'
import { withContext } from '../../store/context'

import FadeIn from '../../components/Animations/FadeIn'
import Badge from '../../components/Badge'
import * as Utils from '../../components/Utils'
import { formatNumber } from '../../utils/numberUtils'

class TrxValue extends Component {
  _formatBalance = (value, currency) => {
    const crypto = ['BTC', 'ETH']

    if (Number.isInteger(value) || crypto.indexOf(currency) >= 0) {
      return formatNumber(value, true)
    } else {
      return value.toFixed(2)
    }
  }

  render () {
    const { trxBalance } = this.props
    const { currency, price } = this.props.context

    return (
      <React.Fragment>
        <Utils.Row justify='flex-start' align='center'>
          <React.Fragment>
            {!!price[currency] && (
              <FadeIn name='usd-value'>
                <Motion
                  defaultStyle={{ price: 0 }}
                  style={{ price: spring(trxBalance * price[currency].price) }}
                >
                  {value => (
                    <Utils.Text size='large'>
                      {this._formatBalance(value.price, currency)}
                    </Utils.Text>
                  )}
                </Motion>
              </FadeIn>
            )}
            <Utils.HorizontalSpacer />
            <Badge bg='#191a2b'>{currency}</Badge>
          </React.Fragment>
        </Utils.Row>
        <Utils.VerticalSpacer />
        {(currency !== 'USD' && price.USD) && (
          <FadeIn name='usd-value'>
            <Motion
              defaultStyle={{ price: 0 }}
              style={{ price: spring(trxBalance * price.USD.price) }}
            >
              {value => (
                <Utils.Text size='xsmall' align='left'>
                  {`${value.price.toFixed(2)} USD`}
                </Utils.Text>
              )}
            </Motion>
          </FadeIn>
        )}
      </React.Fragment>
    )
  }
}

TrxValue.propTypes = {
  trxBalance: PropTypes.number
}

export default withContext(TrxValue)
