import React, { Component } from 'react'
import { FlatList, ActivityIndicator, Clipboard } from 'react-native'
// import MixPanel from 'react-native-mixpanel'
import moment from 'moment'

// Design
import * as Utils from '../../../components/Utils'
import { Colors, Spacing } from '../../../components/DesignSystem'
import { Divider, TransactionRow, TransactionHeader, CopyableText } from '../elements'
import Collapsable from './collapse'

// Utils
import tl from '../../../utils/i18n'

// Services
import { ONE_TRX } from '../../../services/client'

export class LatestTransactions extends Component {
    state = {
      transactions: [],
      selectedTransaction: null
    }

    _onCopyText = async text => {
      await Clipboard.setString(text)
    }

    _renderHeader = () => (
      <TransactionHeader>
        <Utils.Text flex={0.3} size='tiny' color={Colors.slateGrey}>{tl.t('time')}</Utils.Text>
        <Utils.Text flex={0.5} size='tiny' color={Colors.slateGrey}>Transaction Amount</Utils.Text>
        <Utils.View flex={0.2}>{this.props.refreshing ? <ActivityIndicator color={Colors.primaryText} /> : null}</Utils.View>
      </TransactionHeader>
    )

    _renderCollapseView = (expanded, item) => {
      const amount = item.tokenId === '_' ? (item.quant / ONE_TRX).toFixed(3) : item.quant
      const tokenId = item.tokenId === '_' ? 'TRX' : item.tokenId
      return <Utils.View paddingX='medium'>
        <TransactionRow>
          <Utils.Text flex={0.3} size='tiny'>
            {moment(item.createdAt).format('DD/MM/YYYY')}{'\n'}
            {moment(item.createdAt).format('HH:mm:ss')}
          </Utils.Text>

          <Utils.Text flex={0.5} size='small'>
            {amount} {tokenId}
          </Utils.Text>

          <TransactionRow flex={0.2}>
            <Utils.Text size='average' color={Colors.green}>✓</Utils.Text>
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
        <Utils.Text size='tiny' marginY={5} color={Colors.slateGrey}>Hash</Utils.Text>
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
      const { lastTransactions } = this.props
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
            extraData={this.props.refreshing}
            ItemSeparatorComponent={this._renderSeparator}
            keyExtractor={(item) => item.hash}
            initialNumToRender={10}
            onEndReachedThreshold={0.75}
          />
        </React.Fragment>
      )
    }
}

export default LatestTransactions
