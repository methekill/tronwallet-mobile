import React from 'react'
import PropTypes from 'prop-types'
import { Motion, spring } from 'react-motion'

import FadeIn from '../../components/Animations/FadeIn'
import Badge from '../../components/Badge'
import * as Utils from '../../components/Utils'
import { formatNumber } from '../../utils/numberUtils'

const TrxValue = ({ trxBalance, currency }) => (
  <React.Fragment>
    <Utils.Row justify='flex-start' align='center'>
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
      <Utils.HorizontalSpacer />
      <Badge bg='#191a2b' guarantee>{currency}</Badge>
    </Utils.Row>
    <Utils.VerticalSpacer />
  </React.Fragment>
)

TrxValue.displayName = 'TrxValue(Balance Card)'
TrxValue.propTypes = {
  trxBalance: PropTypes.number,
  currency: PropTypes.string
}

export default TrxValue
