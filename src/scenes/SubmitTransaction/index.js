import React, { Component } from 'react'
import { ActivityIndicator, NetInfo, ScrollView } from 'react-native'
import moment from 'moment'
import { Answers } from 'react-native-fabric'
import MixPanel from 'react-native-mixpanel'

// Design
import * as Utils from '../../components/Utils'
import { Colors } from '../../components/DesignSystem'
import ButtonGradient from '../../components/ButtonGradient'
import LoadingScene from '../../components/LoadingScene'
import NavigationHeader from '../../components/Navigation/Header'
import { DetailRow, ExchangeRow, RowView } from './elements'

// Service
import Client from '../../services/client'

// Utils
import tl from '../../utils/i18n'
import buildTransactionDetails, { translateError } from './detailMap'
import getTransactionStore from '../../store/transactions'
import { withContext } from '../../store/context'
import { logSentry } from '../../utils/sentryUtils'
import { updateAssets } from '../../utils/assetsUtils'

const ANSWERS_TRANSACTIONS = ['Transfer', 'Vote', 'Participate', 'Freeze']

class TransactionDetail extends Component {
  state = {
    loadingData: true,
    loadingSubmit: false,
    transactionData: null,
    signedTransaction: null,
    submitted: false,
    submitError: null,
    isConnected: null,
    tokenAmount: null,
    exchangeOption: { trxAmount: 0, isExchangeable: false, assetName: '', assetId: '' },
    exchange: {
      loading: {
        send: false,
        receive: false
      },
      result: {
        send: null,
        receive: null
      },
      error: null
    },
    nowDate: new Date().getTime()
  }

  componentDidMount () {
    this._navListener = this.props.navigation.addListener('didFocus', this._loadData)
  }

  componentWillUnmount () {
    this._navListener.remove()
    if (this.closeTransactionDetails) {
      clearTimeout(this.closeTransactionDetails)
    }
  }

  sleep (time) {
    return new Promise(resolve => {
      setTimeout(resolve, time)
    })
  }

  _loadData = async () => {
    const { navigation } = this.props

    const signedTransaction = navigation.getParam('tx', '')
    const tokenAmount = navigation.getParam('tokenAmount', 0)
    const exchangeOption = navigation.getParam('exchangeOption', {})

    const connection = await NetInfo.getConnectionInfo()
    const isConnected = !(connection.type === 'none')

    this.setState({ isConnected })
    if (!isConnected) {
      this.setState({ loadingData: false })
      return null
    }

    try {
      const transactionData = await Client.getTransactionDetails(signedTransaction)
      this.setState({
        transactionData,
        signedTransaction,
        tokenAmount,
        exchangeOption
      })
    } catch (error) {
      this.setState({ submitError: error.message })
      logSentry(error, 'Submit Tx - Load')
    } finally {
      this.setState({ loadingData: false })
    }
  }

  _navigateNext = () => {
    const { navigation } = this.props
    const transaction = this._getTransactionObject()
    const stackToReset = this._getStackToReset(transaction.type)
    navigation.navigate('TransactionSuccess', { stackToReset, transaction })
  }

  _getTransactionObject = () => {
    const { transactionData, tokenAmount } = this.state
    const {
      hash,
      amount,
      contractType,
      ownerAddress,
      toAddress,
      assetName,
      assetId
    } = transactionData

    const type = Client.getContractType(contractType)
    const transaction = {
      id: hash,
      type,
      contractData: {
        transferFromAddress: ownerAddress,
        transferToAddress: toAddress,
        tokenName: contractType === 1 ? 'TRX' : assetName
      },
      ownerAddress: ownerAddress,
      timestamp: new Date().getTime(),
      confirmed: false
    }

    switch (type) {
      case 'Transfer':
        transaction.contractData.tokenId = '1'
        transaction.contractData.amount = amount
        break
      case 'Transfer Asset':
        transaction.contractData.tokenId = assetId
        transaction.contractData.amount = amount
        break
      case 'Freeze':
        transaction.contractData.frozenBalance = transactionData.frozenBalance
        break
      case 'Vote':
        transaction.contractData.votes = transactionData.votesList
        break
      case 'Participate':
        transaction.tokenPrice = amount / tokenAmount
        transaction.contractData.amount = amount
        transaction.contractData.tokenId = assetId
        break
      case 'Unfreeze':
        transaction.contractData.frozenBalance = tokenAmount
        break
      default:
        transaction.contractData.amount = amount
        break
    }
    return transaction
  }

  _getExchangeResult = async () => {
    const { context, navigation } = this.props
    const { tokenAmount, exchange, exchangeOption, nowDate } = this.state
    for (let i = 0; i < 5; i++) {
      try {
        const params = {
          address: context.publicKey,
          amount: tokenAmount,
          asset: exchangeOption.assetName,
          bot: context.exchangeBot
        }
        const result = await Client.getTransactionFromExchange(params)
        if (result && new Date(result.createdAt).getTime() > nowDate) {
          this.setState({
            exchange: {
              ...exchange,
              result: { ...exchange.result, receive: 'SUCCESS' },
              loading: { ...exchange.loading, receive: false }
            }
          })
          setTimeout(
            () =>
              navigation.navigate('TransactionSuccess', {
                stackToReset: 'ParticipateHome',
                nextRoute: 'Transactions'
              }),
            1500
          )
          return
        }
        await this.sleep(2000)
      } catch (error) {
        logSentry('Error on Exchange', error)
        await this.sleep(2000)
      }
    }

    this.setState({
      exchange: {
        ...exchange,
        result: { ...exchange.result, receive: 'FAIL' },
        loading: { ...exchange.loading, receive: false },
        error: tl.t('submitTransaction.exchange.error')
      }
    })
  }

  _setSubmission = () => {
    const { exchangeOption } = this.state
    if (exchangeOption.isExchangeable) {
      this._submitExchangeTransaction()
    } else {
      this._submitTransaction()
    }
  }

  _submitExchangeTransaction = async () => {
    const {
      signedTransaction,
      exchange,
      exchangeOption,
      transactionData: { hash }
    } = this.state
    const store = await getTransactionStore()
    const transaction = this._getTransactionObject()

    this.setState({
      exchange: { ...exchange, loading: { send: true, receive: false } },
      submitted: true,
      submitError: null
    })

    try {
      store.write(() => {
        store.create('Transaction', transaction, true)
      })
      const { code } = await Client.broadcastTransaction(signedTransaction)
      if (code === 'SUCCESS') {
        // TODO - Remove this piece of code when transactions come with Participate Price
        updateAssets(0, 2, exchangeOption.assetName)

        this.setState({
          exchange: {
            ...exchange,
            loading: { receive: true, send: false },
            result: { ...exchange.result, send: 'SUCCESS' }
          }
        }, this._getExchangeResult)
      }
    } catch (error) {
      // This needs to be adapted better from serverless api
      const errorMessage =
        error.response && error.response.data
          ? error.response.data.error
          : error.message
      this.setState({
        submitError: translateError(errorMessage),
        loadingSubmit: false,
        submitted: true,
        exchange: {
          ...exchange,
          loading: { receive: false, send: false },
          result: { ...exchange.result, send: 'FAIL' }
        }
      })
      logSentry(error, 'Submit Exchange TX - Submit')
      store.write(() => {
        const lastTransaction = store.objectForPrimaryKey('Transaction', hash)
        store.delete(lastTransaction)
      })
    }
  }

  _submitTransaction = async () => {
    const { signedTransaction, transactionData: { hash } } = this.state
    this.setState({ loadingSubmit: true, submitError: null })
    const store = await getTransactionStore()
    const transaction = this._getTransactionObject()
    try {
      store.write(() => {
        store.create('Transaction', transaction, true)
      })
      const { code } = await Client.broadcastTransaction(signedTransaction)

      if (code === 'SUCCESS') {
        if (ANSWERS_TRANSACTIONS.includes(transaction.type)) {
          Answers.logCustom('Transaction Operation', { type: transaction.type })
        }
        await this.props.context.loadUserData()
        // TODO - Remove this piece of code when transactions come with Participate Price

        if (transaction.type === 'Participate') {
          updateAssets(0, 2, transaction.contractData.tokenId)
        }
      }
      this.setState({ submitError: null, loadingSubmit: false, submitted: true }, this._navigateNext)
    } catch (error) {
      // This needs to be adapted better from serverless api
      const errorMessage =
        error.response && error.response.data
          ? error.response.data.error
          : error.message
      this.setState({
        submitError: translateError(errorMessage),
        loadingSubmit: false,
        submitted: true
      })
      logSentry(error, 'Submit Tx - Submit')
      store.write(() => {
        const lastTransaction = store.objectForPrimaryKey('Transaction', hash)
        store.delete(lastTransaction)
      })
    }
  }

  _getStackToReset = transactionType => {
    if (
      transactionType === 'Transfer Asset' ||
      transactionType === 'Transfer' ||
      transactionType === 'Freeze' ||
      transactionType === 'Unfreeze'
    ) {
      return 'BalanceScene'
    }
    if (transactionType === 'Participate' || transactionType === 'Exchange') {
      return 'ParticipateHome'
    }
    if (transactionType === 'Vote') {
      return 'Vote'
    }
    return null
  }

  _renderExchangeContracts = () => {
    const { exchangeOption, exchange, tokenAmount } = this.state
    return (
      <Utils.View paddingX='medium' paddingY='small'>
        <DetailRow title='Exchange' text='Token sale from @TronWallet.' />
        <DetailRow title='TRX' text={exchangeOption.trxAmount} />
        <DetailRow
          title='Asset'
          text={`${tokenAmount} ${exchangeOption.assetName}`}
        />
        <ExchangeRow
          title={tl.t('submitTransaction.exchange.send', { sendtoken: 'TRX ' })}
          loading={exchange.loading.send}
          result={exchange.result.send}
        />
        <ExchangeRow
          title={tl.t('submitTransaction.exchange.receive', {
            receivetoken: exchangeOption.assetName
          })}
          loading={exchange.loading.receive}
          result={exchange.result.receive}
        />
        {exchange.error && (
          <Utils.View>
            <RowView>
              <Utils.Text secondary size='smaller'>
                {tl.t('message').toUpperCase()}
              </Utils.Text>
              <Utils.VerticalSpacer size='small' />
              <Utils.Text
                align='right'
                style={{ maxWidth: '70%' }}
                size='xsmall'
              >
                {exchange.error}
              </Utils.Text>
            </RowView>
            <Utils.View height={8} />
            <ButtonGradient
              text='CONTINUE'
              onPress={() => this.props.navigation.navigate('Transactions')}
              font='bold'
            />
          </Utils.View>
        )}
      </Utils.View>
    )
  }

  _renderContracts = () => {
    const { transactionData, nowDate, tokenAmount } = this.state
    if (!transactionData) {
      return (
        <Utils.View paddingX={'medium'} paddingY={'small'}>
          <DetailRow
            key='NOTLOADED'
            title={tl.t('submitTransaction.error.noData')}
            text=' '
          />
        </Utils.View>
      )
    }

    const contractsElements = buildTransactionDetails(transactionData, tokenAmount)
    contractsElements.push(
      <DetailRow
        key='TIME'
        title={tl.t('submitTransaction.time')}
        text={moment(nowDate).format('DD/MM/YYYY HH:mm:ss')}
      />
    )

    return (
      <Utils.View paddingX={'medium'} paddingY={'small'}>
        {contractsElements}
      </Utils.View>
    )
  }

  _renderSubmitButton = () => {
    const { loadingSubmit, submitted, submitError } = this.state

    return (
      <Utils.View marginTop={5} paddingX={'medium'}>
        {loadingSubmit ? (
          <ActivityIndicator size='small' color={Colors.primaryText} />
        ) : (
          !submitted && (
            <ButtonGradient
              text={tl.t('submitTransaction.button.submit')}
              onPress={() =>
                this.props.navigation.navigate('Pin', {
                  shouldGoBack: true,
                  testInput: pin => pin === this.props.context.pin,
                  onSuccess: () => {
                    MixPanel.trackWithProperties('Pin Validation', {
                      type: 'Submit transaction'
                    })
                    this._setSubmission()
                  }
                })
              }
              disabled={submitted || submitError}
              font='bold'
            />
          )
        )}
      </Utils.View>
    )
  }

  _renderRetryConnection = () => (
    <Utils.View paddingX='medium' align='center' justify='center'>
      <Utils.Text size='smaller'>
        {tl.t('submitTransaction.disconnectedMessage')}
      </Utils.Text>
      <Utils.VerticalSpacer />
      <ButtonGradient
        text={tl.t('submitTransaction.button.tryAgain')}
        onPress={this._loadData}
        size='small'
      />
    </Utils.View>
  )

  render () {
    const {
      submitError,
      loadingData,
      isConnected,
      loadingSubmit,
      exchange
    } = this.state
    const { exchangeOption } = this.state

    if (loadingData) return <LoadingScene />

    return (
      <Utils.SafeAreaView>
        <React.Fragment>
          <NavigationHeader
            title={tl.t('submitTransaction.title')}
            onClose={
              !loadingSubmit &&
              !exchange.loading.send &&
              !exchange.loading.receive
                ? () => this.props.navigation.goBack()
                : null
            }
          />
          <Utils.Container>
            <ScrollView>
              {exchangeOption.isExchangeable
                ? this._renderExchangeContracts()
                : this._renderContracts()}
              {isConnected
                ? this._renderSubmitButton()
                : this._renderRetryConnection()}
              <Utils.View align='center' justify='center'>
                {submitError && <Utils.Error>{submitError}</Utils.Error>}
              </Utils.View>
            </ScrollView>
          </Utils.Container>
        </React.Fragment>
      </Utils.SafeAreaView>
    )
  }
}
export default withContext(TransactionDetail)
