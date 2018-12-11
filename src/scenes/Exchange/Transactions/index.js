import React, { Component } from 'react'
import { FlatList, ActivityIndicator, Alert, TouchableOpacity, Clipboard } from 'react-native'
// import MixPanel from 'react-native-mixpanel'
import moment from 'moment'

// Design
import * as Utils from '../../../components/Utils'
import { Colors, Spacing } from '../../../components/DesignSystem'
import { Divider, TransactionRow, TransactionHeader, ExpandRow, CopyableText } from '../elements'

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
      Alert.alert('Clipboard', tl.t('receive.clipboardCopied'))
    }

    _onExpandTransaction = hash => {
      const { selectedTransaction } = this.state
      const nextTransaction = selectedTransaction === hash ? null : hash
      this.setState({selectedTransaction: nextTransaction})
    }

    _renderHeader = () => {
      return <TransactionHeader>
        <Utils.Text flex={0.3} size='tiny' color={Colors.slateGrey}>Time</Utils.Text>
        <Utils.Text flex={0.5} size='tiny' color={Colors.slateGrey}>Transaction Amount</Utils.Text>
        <Utils.View flex={0.2} />
      </TransactionHeader>
    }

    _renderItem = ({item}) => {
      const isSelected = this.state.selectedTransaction === item.hash
      const amount = item.tokenId === '_' ? item.quant / ONE_TRX : item.quant
      const tokenId = item.tokenId === '_' ? 'TRX' : item.tokenId

      return <Utils.View paddingY='medium' paddingX='medium'>
        <TransactionRow>
          <Utils.Text flex={0.3} size='tiny'>
            {moment(item.createdAt).format('DD/MM/YYYY')}{'\n'}
            {moment(item.createdAt).format('HH:mm:ss')}
          </Utils.Text>

          <Utils.Text flex={0.5} size='small'>
            {amount} {tokenId}
          </Utils.Text>

          <ExpandRow>
            <Utils.Text size='average' color={Colors.green}>✓</Utils.Text>
            <Utils.HorizontalSpacer size='medium' />
            <TouchableOpacity onPress={() => this._onExpandTransaction(item.hash)}>
              <Utils.Text size='large' font='light' color={Colors.greyBlue}>
                {isSelected ? '-' : '+'}
              </Utils.Text>
            </TouchableOpacity>
          </ExpandRow>

        </TransactionRow>
        {isSelected &&
        <Utils.View>
          <Utils.Text size='tiny' marginY={5} color={Colors.slateGrey}>Hash</Utils.Text>
          <CopyableText onPress={this._onCopyText} text={item.hash} />
          <Utils.Text size='tiny' marginY={5} color={Colors.slateGrey}>Address</Utils.Text>
          <CopyableText onPress={this._onCopyText} text={item.ownerAddress} />
        </Utils.View>}
      </Utils.View>
    }

    _renderEmptyList = () => (
      <Utils.View justify='center' align='center' padding={15}>
        <ActivityIndicator size='small' color={Colors.primaryText} />
      </Utils.View>
    )

    _renderSeparator = () => (<Divider />)

    render () {
      const { lastTransactions, selectedTransaction } = this.props
      return (
        <React.Fragment>
          <Utils.View height={Spacing.medium} />
          <Divider full />
          <Utils.View align='center' justify='center' marginY={Spacing.medium}>
            <Utils.Text size='xsmall'>TRANSACTIONS</Utils.Text>
          </Utils.View>
          <FlatList
            data={lastTransactions}
            renderItem={this._renderItem}
            ListHeaderComponent={this._renderHeader}
            ListEmptyComponent={this._renderEmptyList}
            extraData={[selectedTransaction]}
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
