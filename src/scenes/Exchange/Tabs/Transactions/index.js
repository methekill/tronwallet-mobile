import React, { PureComponent } from 'react'
import { FlatList, ActivityIndicator, Alert, Clipboard } from 'react-native'
import moment from 'moment'
import PropTypes from 'prop-types'

// Design
import * as Utils from '../../../../components/Utils'
import { Colors, Spacing } from '../../../../components/DesignSystem'
import { Divider, TransactionRow, TransactionHeader, CopyableText } from '../../elements'
import FontelloIcon from '../../../../components/FontelloIcon'
import Collapsable from './collapse'

// Utils
import tl from '../../../../utils/i18n'
import { formatNumber } from '../../../../utils/numberUtils'

// Services
import { ONE_TRX } from '../../../../services/client'

export class LatestTransactions extends PureComponent {
    _onCopyText = async text => {
      await Clipboard.setString(text)
      Alert.alert('Clipboard', 'Text copied')
    }

    _getTokenIdentifier = tokenId => {
      const { firstTokenId, secondTokenId, secondTokenAbbr, firstTokenAbbr } = this.props.exchangeData
      if (tokenId === '_') return 'TRX'
      return tokenId === firstTokenId ? (firstTokenAbbr || firstTokenId) : (secondTokenAbbr || secondTokenId)
    }

    _renderHeader = () => (
      <TransactionHeader>
        <Utils.Text flex={0.3} size='tiny' color={Colors.slateGrey}>{tl.t('time')}</Utils.Text>
        <Utils.Text flex={0.5} marginX={5} size='tiny' color={Colors.slateGrey}>{tl.t('exchange.txAmount')}</Utils.Text>
        <Utils.View flex={0.2}>{this.props.refreshingExchange ? <ActivityIndicator color={Colors.primaryText} /> : null}</Utils.View>
      </TransactionHeader>
    )

    _renderCollapseView = (expanded, item) => {
      const amount = item.tokenId === '_' ? (item.quant / ONE_TRX).toFixed(3) : item.quant
      const tokenIdentifier = this._getTokenIdentifier(item.tokenId)

      return <Utils.View paddingX='medium'>
        <TransactionRow>
          <Utils.Text flex={0.3} size='tiny'>
            {moment(item.createdAt).format('DD/MM/YYYY')}{'\n'}
            {moment(item.createdAt).format('HH:mm:ss')}
          </Utils.Text>

          <Utils.Text marginX={5} flex={0.5} size='small'>
            {formatNumber(amount)} {tokenIdentifier}
          </Utils.Text>

          <TransactionRow flex={0.2}>
            <FontelloIcon name='check' size={17} color={Colors.weirdGreen} />
            <Utils.HorizontalSpacer />
            <Utils.Text size='large' font='light' color={Colors.greyBlue}>
              {expanded ? '-' : '+'}
            </Utils.Text>
          </TransactionRow>
        </TransactionRow>
      </Utils.View>
    }

    _renderHiddenCollapseView = (_, item) => (
      <Utils.View paddingX='medium'>
        <Utils.Text size='tiny' marginY={5} color={Colors.slateGrey}>{tl.t('hash')}</Utils.Text>
        <CopyableText onPress={() => this._onCopyText(item.hash)} text={item.hash} />
        <Utils.Text size='tiny' marginY={5} color={Colors.slateGrey}>{tl.t('address')}</Utils.Text>
        <CopyableText onPress={() => this._onCopyText(item.ownerAddress)} text={item.ownerAddress} />
      </Utils.View>
    )

    _renderItem = ({item}) => (
      <Collapsable
        containerStyle={{paddingVertical: Spacing.medium}}
        renderView={(expanded) => this._renderCollapseView(expanded, item)}
        renderCollapseView={(expanded) => this._renderHiddenCollapseView(expanded, item)}
      />
    )

    _renderSeparator = () => (<Divider />)

    render () {
      const { lastTransactions, refreshingExchange } = this.props
      return (
        <React.Fragment>
          <Utils.View height={Spacing.medium} />
          <Divider full />
          <Utils.View align='center' justify='center' marginY={Spacing.medium}>
            <Utils.Text size='xsmall'>{tl.t('txs')}</Utils.Text>
          </Utils.View>
          <FlatList
            data={lastTransactions}
            renderItem={this._renderItem}
            ListHeaderComponent={this._renderHeader}
            extraData={refreshingExchange}
            ItemSeparatorComponent={this._renderSeparator}
            keyExtractor={(item) => item.hash}
            initialNumToRender={10}
            maxToRenderPerBatch={10}
          />
        </React.Fragment>
      )
    }
}

LatestTransactions.propTypes = {
  lastTransactions: PropTypes.array.isRequired,
  refreshingExchange: PropTypes.bool.isRequired,
  exchangeData: PropTypes.object.isRequired
}

LatestTransactions.defaultProps = {
  lastTransactions: [],
  refreshingExchange: false
}
export default LatestTransactions
