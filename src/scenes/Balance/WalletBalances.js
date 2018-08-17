import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'

import tl from '../../utils/i18n'
import { formatNumber } from '../../utils/numberUtils'
import { orderBalances } from '../../utils/balanceUtils'
import { Colors } from '../../components/DesignSystem'
import Badge from '../../components/Badge'
import * as Utils from '../../components/Utils'
import { orderAssets } from '../../utils/assetsUtils'
import { AsyncStorage } from '../../../node_modules/aws-amplify/lib/Common'
import { USER_FILTERED_TOKENS } from '../../utils/constants'

class WalletBalances extends PureComponent {
  state = {
    currentUserTokens: '',
    balancesToDisplay: []
  }

  async componentDidUpdate () {
    try {
      const { currentUserTokens } = this.state
      const { balances } = this.props

      const filteredTokens = await AsyncStorage.getItem(USER_FILTERED_TOKENS)

      if (currentUserTokens !== filteredTokens) {
        const parsedTokens = JSON.parse(filteredTokens)
        const filteredBalances = balances.filter(asset => parsedTokens.findIndex(name => name === asset.name) !== -1)
        const orderedBalances = orderAssets(filteredBalances)

        this.setState({ balancesToDisplay: orderedBalances, currentUserTokens: filteredTokens })
      }
    } catch (error) {
      console.log(error)
    }
  }

  render () {
    const { balancesToDisplay } = this.state

    if (balancesToDisplay.length) {
      return (
        <React.Fragment>
          <Utils.VerticalSpacer size='large' />
          <Utils.Row justify='space-between'>
            <Utils.Text size='xsmall' secondary>
              {tl.t('balance.tokens')}
            </Utils.Text>
            <Utils.Text size='xsmall' secondary>
              {tl.t('balance.holdings')}
            </Utils.Text>
          </Utils.Row>
          <Utils.VerticalSpacer size='big' />
          {balancesToDisplay && orderBalances(balancesToDisplay).map((item) => (
            <Utils.Content key={item.name} paddingHorizontal='none' paddingVertical='medium'>
              <Utils.Row justify='space-between'>
                <Badge bg={Colors.lightestBackground} guarantee={item.verified}>{item.name}</Badge>
                <Utils.Text>{formatNumber(item.balance)}</Utils.Text>
              </Utils.Row>
            </Utils.Content>
          ))}
        </React.Fragment>
      )
    }

    return null
  }
}

WalletBalances.propTypes = {
  balances: PropTypes.array.isRequired
}

export default WalletBalances
