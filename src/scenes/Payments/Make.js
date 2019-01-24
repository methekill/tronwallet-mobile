import React, { PureComponent } from 'react'
import { Alert, ActivityIndicator } from 'react-native'
import { Answers } from 'react-native-fabric'
import MixPanel from 'react-native-mixpanel'

// Design
import * as Utils from '../../components/Utils'
import NavigationHeader from '../../components/Navigation/Header'
import Badge from '../../components/Badge'
import ButtonGradient from '../../components/ButtonGradient'
import { Divider } from './elements'
import { Colors } from '../../components/DesignSystem'
import { translateError } from '../../scenes/SubmitTransaction/detailMap'

// Service
import WalletClient from '../../services/client'

// Utils
import { signTransaction } from '../../utils/transactionUtils'
import withContext from '../../utils/hocs/withContext'
import { formatNumber } from '../../utils/numberUtils'
import getTransactionStore from '../../store/transactions'
import tl from '../../utils/i18n'
import { logSentry, DataError } from '../../utils/sentryUtils'
import { replaceRoute } from '../../utils/navigationUtils'

const NOTIFICATION_TRANSACTIONS = ['Transfer', 'Transfer Asset']

class MakePayment extends PureComponent {
    static navigationOptions = { header: null }

    state = {
      loading: false,
      balances: this.props.context.balances[this.props.context.publicKey],
      transactionData: {}
    }

    _getTransactionObject = (transactionData) => {
      const { hash, amount, assetId, contractType, ownerAddress, toAddress, assetName } = transactionData
      const type = WalletClient.getContractType(contractType)
      const transaction = {
        id: hash,
        type,
        contractData: {
          transferFromAddress: ownerAddress,
          transferToAddress: toAddress,
          tokenName: type === 'Transfer' ? 'TRX' : assetName,
          tokenId: type === 'Transfer' ? '1' : assetId,
          amount
        },
        ownerAddress: ownerAddress,
        timestamp: new Date().getTime(),
        confirmed: false
      }
      return transaction
    }

    _navigateNext = (transactionData) => {
      const lastTransaction = this._getTransactionObject(transactionData)
      this.props.navigation.goBack()
      replaceRoute(this.props.navigation, 'TransactionSuccess', {stackToReset: 'BalanceScene', transaction: lastTransaction})
    }

    _checkToken = tokenId => !!this.state.balances.find(b => b.id === tokenId)

    _checkAmount = (amount, tokenId) => this.state.balances.find(b => b.id === tokenId).balance > amount

    _checkPayment = () => {
      const { context, navigation } = this.props
      const { publicKey } = context
      const from = publicKey
      this.setState({ loading: true })
      try {
        const { address, amount, tokenId, description } = navigation.getParam('payment')
        if (from === address) throw new DataError(tl.t('makePayment.error.receiver'))
        if (!this._checkToken(tokenId)) throw new DataError(tl.t('makePayment.error.token'))
        if (!this._checkAmount(amount, tokenId)) throw new DataError(tl.t('makePayment.error.amount'))

        navigation.navigate('Pin', {
          shouldGoBack: true,
          testInput: pin => pin === context.pin,
          onSuccess: () => {
            const payload = { from, to: address, amount, tokenId, data: description }
            MixPanel.trackWithProperties('Pin Validation - check payment', payload)
            this._buildTransaction(payload)
          }
        })
      } catch (error) {
        if (error.name === 'DataError') {
          Alert.alert(tl.t('warning'), error.message)
        } else {
          Alert.alert(tl.t('warning'), tl.t('makePayment.error.receiver'))
          logSentry(error, 'Make Payment - Check')
        }
        this.setState({loading: false})
      }
    }

    _buildTransaction = async ({ to, amount, tokenId, from, data }) => {
      try {
        // Build Transaction
        const transactionUnsigned = await WalletClient.getTransferTransaction({ from, to, amount, token: tokenId, data })
        // Sign Transaction
        const { accounts, publicKey } = this.props.context
        const transactionSigned = await signTransaction(
          accounts.find(item => item.address === publicKey).privateKey,
          transactionUnsigned
        )
        // Get Transaction Signed Data
        const transactionData = await WalletClient.getTransactionDetails(transactionSigned)
        // Proceed to broadcast
        if (transactionData) {
          this._submitTransaction(transactionData, transactionSigned)
        } else throw new Error('Empty Transaction Data')
      } catch (error) {
        Alert.alert(tl.t('warning'), tl.t('error.default'))
        this.setState({ loading: false })
        logSentry(error, 'Make Payment - Build Tx')
      }
    }

    _submitTransaction = async (transactionData, transactionSigned) => {
      const { hash } = transactionData
      const store = await getTransactionStore()
      try {
        const transaction = this._getTransactionObject(transactionData)
        store.write(() => {
          store.create('Transaction', transaction, true)
        })
        const { code } = await WalletClient.broadcastTransaction(transactionSigned)

        if (code === 'SUCCESS') {
          if (NOTIFICATION_TRANSACTIONS.includes(transaction.type)) {
            Answers.logCustom('Payment Operation', { type: transaction.type })
          }

          MixPanel.trackWithProperties('Submit Transaction', {
            'payment.type': transaction.type,
            'payment.transferFromAddress': transaction.contractData.transferFromAddress,
            'payment.transferToAddress': transaction.contractData.transferToAddress,
            'payment.tokenName': transaction.contractData.tokenName,
            'payment.amount': transaction.contractData.amount
          })
          await this.props.context.loadUserData()
        }
        this.setState({ loading: false }, this._navigateNext(transactionData))
      } catch (error) {
        // This needs to be adapted better from serverless api
        const errorMessage = error.response && error.response.data ? translateError(error.response.data.error)
          : tl.t('error.default')
        Alert.alert(tl.t('warning'), errorMessage)
        store.write(() => {
          const lastTransaction = store.objectForPrimaryKey('Transaction', hash)
          store.delete(lastTransaction)
        })
        this.setState({ loading: false })
        logSentry(error, 'Make Payment - Transaction Failed')
      }
    }

    render () {
      const { navigation } = this.props
      const { loading } = this.state
      const { address, amount, tokenName, tokenId, description } = this.props.navigation.getParam('payment')

      return (
        <Utils.Container>
          <NavigationHeader
            title={tl.t('makePayment.pay')}
            onBack={() => { navigation.goBack() }}
            noBorder
          />
          <Utils.VerticalSpacer size='large' />
          <Utils.View align='center' justify='center'>
            <Utils.Text marginBottom={5} numberOfLines={2} size='xsmall' secondary>{tl.t('send.input.amount')}</Utils.Text>
            <Utils.Row justify='space-between' align='center'>
              <Utils.Text size='large'>{formatNumber(amount, true)}</Utils.Text>
              <Utils.HorizontalSpacer />
              <Badge id={tokenId}>{tokenName}</Badge>
            </Utils.Row>
          </Utils.View>
          <Divider size='medium' marginBottom={10} />
          <Utils.View paddingX='medium'>
            <Utils.Text marginBottom={15} size='xsmall' secondary>{tl.t('send.input.to')}</Utils.Text>
            <Utils.Text font='regular' size='xsmall'>{address}</Utils.Text>
          </Utils.View>
          <Divider size='medium' marginBottom={10} />
          <Utils.View paddingX='medium'>
            <Utils.Text marginBottom={15} size='xsmall' secondary>{tl.t('send.input.description')}</Utils.Text>
            <Utils.Text font='regular' size='xsmall'>{description || tl.t('makePayment.error.description')}</Utils.Text>
          </Utils.View>
          <Utils.VerticalSpacer size='large' />
          <Utils.View paddingX='medium'>
            {loading
              ? (<ActivityIndicator size='small' color={Colors.primaryText} />)
              : (<ButtonGradient text={tl.t('makePayment.confirm')} onPress={this._checkPayment} />)}
          </Utils.View>
        </Utils.Container>
      )
    }
}

export default withContext(MakePayment)
