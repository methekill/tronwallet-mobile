import React, { PureComponent } from 'react'
import { Alert, ActivityIndicator } from 'react-native'
import { Answers } from 'react-native-fabric'
import OneSignal from 'react-native-onesignal'

// Design
import * as Utils from '../../components/Utils'
import NavigationHeader from '../../components/Navigation/Header'
import Badge from '../../components/Badge'
import ButtonGradient from '../../components/ButtonGradient'
import { Divider } from './elements'
import { Colors } from '../../components/DesignSystem'

// Service
import WalletClient from '../../services/client'

// Utils
import { signTransaction } from '../../utils/transactionUtils'
import withContext from '../../utils/hocs/withContext'
import getBalanceStore from '../../store/balance'
import { formatNumber } from '../../utils/numberUtils'
import { translateError } from '../../scenes/SubmitTransaction/detailMap'
import getTransactionStore from '../../store/transactions'
import tl from '../../utils/i18n'

const NOTIFICATION_TRANSACTIONS = ['Transfer', 'Transfer Asset']

class DataError extends Error {
  constructor (message) {
    super(message)
    this.name = 'DataError'
    this.message = message
  }
}

class MakePayment extends PureComponent {
    static navigationOptions = { header: null }

    state = {
      loading: false,
      balances: []
    }

    componentDidMount () {
      this._loadData()
    }

    _loadData = async () => {
      const store = await getBalanceStore()
      const balances = store.objects('Balance').map(item => Object.assign({}, item))
      this.setState({ balances })
    }

    _getTransactionObject = (transactionData) => {
      const { hash, contracts } = transactionData
      const type = WalletClient.getContractType(contracts[0].contractTypeId)
      const transaction = {
        id: hash,
        type,
        contractData: {
          transferFromAddress: contracts[0].from || contracts[0].ownerAddress,
          transferToAddress: contracts[0].to,
          tokenName: type === 'Transfer' ? 'TRX' : contracts[0].token,
          amount: contracts[0].amount
        },
        ownerAddress: contracts[0].from || contracts[0].ownerAddress,
        timestamp: Date.now(),
        confirmed: false
      }
      return transaction
    }

    _updateBalancesStore = async balances => {
      try {
        const balances = await WalletClient.getBalances(this.props.context.pin)
        const store = await getBalanceStore()
        store.write(() => balances.map(item => store.create('Balance', item, true)))
      } catch (error) {
        Alert.alert(tl.t('warning'), tl.t('balance.error.loadingData'))
      }
    }

    _navigateNext = () => {
      const { navigation } = this.props
      navigation.navigate('TransactionSuccess', {stackToReset: 'BalanceScene'})
    }

    _checkToken = token => !!this.state.balances.find(b => b.name === token)

    _checkAmount = (amount, token) => this.state.balances.find(b => b.name === token).balance > amount

    _checkPayment = () => {
      const { context, navigation } = this.props
      const from = context.publicKey.value
      this.setState({loading: true})
      try {
        const { address, amount, token } = navigation.getParam('payment')
        if (from === address) throw new DataError(tl.t('makePayment.error.receiver'))
        if (!this._checkToken(token)) throw new DataError(tl.t('makePayment.error.token'))
        if (!this._checkAmount(amount, token)) throw new DataError(tl.t('makePayment.error.amount'))

        navigation.navigate('Pin', {
          shouldGoBack: true,
          testInput: pin => pin === context.pin,
          onSuccess: () => this._buildTransaction({from, to: address, amount, token})
        })
      } catch (error) {
        if (error.name === 'DataError') Alert.alert(tl.t('warning'), error.message)
        else Alert.alert(tl.t('warning'), tl.t('makePayment.error.receiver'))
        this.setState({loading: false})
      }
    }

    _buildTransaction = async ({to, amount, token, from}) => {
      try {
        // Build Transaction
        const data = await WalletClient.getTransferTransaction({from, to, amount, token})
        // Sign Transaction
        const transactionSigned = await signTransaction(this.props.context.pin, data)
        // Get Transaction Signed Data
        const transactionData = await WalletClient.getTransactionDetails(transactionSigned)
        // Proceed to broadcast
        this._submitTransaction(transactionData, transactionSigned)
      } catch (error) {
        Alert.alert(tl.t('warning'), tl.t('error.default'))
        this.setState({ loading: false })
      }
    }

    _submitTransaction = async (transactionData, transactionSigned) => {
      const { hash } = transactionData
      const store = await getTransactionStore()
      try {
        const transaction = this._getTransactionObject(transactionData)
        store.write(() => { store.create('Transaction', transaction, true) })
        const { code } = await WalletClient.broadcastTransaction(transactionSigned)
        if (code === 'SUCCESS') {
          if (NOTIFICATION_TRANSACTIONS.includes(transaction.type)) {
            Answers.logCustom('Payment Operation', { type: transaction.type })
            // if the receiver is a tronwallet user we'll find his devices here
            const response = await WalletClient.getDevicesFromPublicKey(transaction.contractData.transferToAddress)
            if (response.data.users.length) {
              const content = {
                'en': tl.t('submitTransaction.notificationPayment', { address: transaction.contractData.transferFromAddress })
              }
              response.data.users.map(device => {
                OneSignal.postNotification(content, transaction, device.deviceid)
              })
            }
          }
          await this._updateBalancesStore()
        }
        this.setState({ loading: false }, this._navigateNext)
      } catch (error) {
        // This needs to be adapted better from serverless api
        const errorMessage = error.response && error.response.data ? translateError(error.response.data.error)
          : tl.t('error.default')
        Alert.alert('Warning', errorMessage)
        store.write(() => {
          const lastTransaction = store.objectForPrimaryKey('Transaction', hash)
          store.delete(lastTransaction)
        })
        this.setState({loading: false})
      }
    }

    render () {
      const { navigation } = this.props
      const { loading } = this.state
      const { address, amount, token, description } = this.props.navigation.getParam('payment')

      return (
        <Utils.Container>
          <NavigationHeader
            title='PAY'
            onBack={() => { navigation.goBack() }}
            noBorder
          />
          <Utils.VerticalSpacer size='large' />
          <Utils.View align='center' justify='center'>
            <Utils.Text marginBottom={5} numberOfLines={2} size='xsmall' secondary>{tl.t('send.input.amount')}</Utils.Text>
            <Utils.Row justify='space-between' align='center'>
              <Utils.Text size='large'>{formatNumber(amount, true)}</Utils.Text>
              <Utils.HorizontalSpacer />
              <Badge>{token}</Badge>
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
              ? <ActivityIndicator size='small' color={Colors.primaryText} />
              : <ButtonGradient
                text={tl.t('makePayment.confirm')}
                onPress={this._checkPayment}
              />}
          </Utils.View>
        </Utils.Container>
      )
    }
}

export default withContext(MakePayment)
