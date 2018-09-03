import React, { PureComponent } from 'react'
import { Motion, spring } from 'react-motion'
import { Context } from '../../store/context'

import tl from '../../utils/i18n'
import FadeIn from '../../components/Animations/FadeIn'
import * as Utils from '../../components/Utils'
import { formatNumber } from '../../utils/numberUtils'

class TrxInfo extends PureComponent {
  render () {
    const { currency } = this.props

    return !!currency && (
      <Context.Consumer>
        {({ freeze, price, publicKey }) =>
          price.price &&
          freeze[publicKey] && (
            <FadeIn name='tronprice'>
              <Utils.VerticalSpacer size='medium' />
              <Utils.Row justify='space-between'>
                <Utils.View align='center'>
                  <Utils.Text size='xsmall' secondary>{tl.t('tronPower')}</Utils.Text>
                  <Motion
                    defaultStyle={{ power: 0 }}
                    style={{
                      power: spring(freeze[publicKey] ? freeze[publicKey].total : 0)
                    }}
                  >
                    {value => (
                      <Utils.Text padding={4}>{`${value.power.toFixed(0)}`}</Utils.Text>
                    )}
                  </Motion>
                </Utils.View>
                <Utils.View align='center'>
                  <Utils.Text size='xsmall' secondary>{tl.t('trxPrice')}</Utils.Text>
                  <Motion
                    defaultStyle={{ price: 0 }}
                    style={{ price: spring(price.price) }}
                  >
                    {value => (
                      <Utils.Text padding={4}>
                        {`${formatNumber(value.price)} ${currency}`}
                      </Utils.Text>
                    )}
                  </Motion>
                </Utils.View>
                <Utils.View align='center'>
                  <Utils.Text size='xsmall' secondary>{tl.t('balance.bandwidth')}</Utils.Text>
                  <Motion
                    defaultStyle={{ bandwidth: 0 }}
                    style={{
                      bandwidth: spring(freeze[publicKey].bandwidth.netRemaining)
                    }}
                  >
                    {value => (
                      <Utils.Text padding={4}>
                        {`${value.bandwidth.toFixed(0)}`}
                      </Utils.Text>
                    )}
                  </Motion>
                </Utils.View>
              </Utils.Row>
              <Utils.VerticalSpacer size='medium' />
            </FadeIn>
          )
        }
      </Context.Consumer>
    )
  }
}

export default TrxInfo
