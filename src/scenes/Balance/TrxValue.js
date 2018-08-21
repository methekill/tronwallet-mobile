import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import { Motion, spring, presets } from 'react-motion'
import { Context } from '../../store/context'

import FadeIn from '../../components/Animations/FadeIn'
import Badge from '../../components/Badge'
import * as Utils from '../../components/Utils'
import { formatNumber } from '../../utils/numberUtils'

class TrxValue extends PureComponent {
  _formatBalance = (value, currency) => {
    const crypto = ['BTC', 'ETH']

    if (Number.isInteger(value) || crypto.indexOf(currency) >= 0) {
      return formatNumber(value, true)
    } else {
      return value.toFixed(2)
    }
  }

  render () {
    const { trxBalance, currency } = this.props

    return (
      <React.Fragment>
        <Utils.Row justify='center' align='center'>
          <React.Fragment>
            <FadeIn name='usd-value'>
              <Motion
                defaultStyle={{ price: 0 }}
                style={{
                  price: spring(
                    trxBalance * this.props.context.price.price,
                    presets.gentle
                  )
                }}
              >
                {value => (
                  <Utils.Text size='large' marginX={8}>
                    {this._formatBalance(value.price, currency)}
                  </Utils.Text>
                )}
              </Motion>
            </FadeIn>
            <Badge>{currency}</Badge>
          </React.Fragment>
        </Utils.Row>
        <Utils.VerticalSpacer />
        {currency !== 'USD' && (
          <Context.Consumer>
            {({ price }) =>
              price.value && (
                <FadeIn name='usd-value'>
                  <Motion
                    defaultStyle={{ price: 0 }}
                    style={{
                      price: spring(
                        trxBalance * price.value,
                        presets.gentle
                      )
                    }}
                  >
                    {value => (
                      <Utils.Text align='center'>
                        {`${value.price.toFixed(2)} USD`}
                      </Utils.Text>
                    )}
                  </Motion>
                </FadeIn>
              )
            }
          </Context.Consumer>
        )}
      </React.Fragment>
    )
  }
}

TrxValue.propTypes = {
  trxBalance: PropTypes.number.isRequired,
  currency: PropTypes.string.isRequired
}

export default props => (
  <Context.Consumer>
    {context => <TrxValue context={context} {...props} />}
  </Context.Consumer>
)
