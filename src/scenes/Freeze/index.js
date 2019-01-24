import React, { Component } from 'react'
import { Alert, Keyboard } from 'react-native'
import moment from 'moment'
import { Answers } from 'react-native-fabric'
import MixPanel from 'react-native-mixpanel'

// Design
import * as Utils from '../../components/Utils'
import Header from '../../components/Header'
import Input from '../../components/Input'
import Badge from '../../components/Badge'
import ButtonGradient from '../../components/ButtonGradient'
import { Colors } from '../../components/DesignSystem'
import KeyboardScreen from '../../components/KeyboardScreen'
import NavigationHeader from '../../components/Navigation/Header'
import FontelloIcon from '../../components/FontelloIcon'
import PercentageSelector from '../../components/SelectorTile'

// Utils
import tl from '../../utils/i18n'
import { signTransaction } from '../../utils/transactionUtils'
import { withContext } from '../../store/context'
import { formatNumber } from '../../utils/numberUtils'
import { logSentry, DataError } from '../../utils/sentryUtils'
import { replaceRoute } from '../../utils/navigationUtils'

// Service
import Client, { ONE_TRX } from '../../services/client'

const PERCENTAGE_OPTIONS = [
  {label: '25%', value: 0.25},
  {label: '50%', value: 0.5},
  {label: '75%', value: 0.75},
  {label: '100%', value: 1.00}
]

class FreezeScene extends Component {
  static navigationOptions = {
    header: null
  }

  state = {
    total: 0,
    amount: '',
    loading: true,
    unfreezeStatus: {
      msg: tl.t('freeze.unfreeze.inThreeDays'),
      disabled: false
    }
  }

  componentDidMount () {
    Answers.logContentView('Page', 'Freeze')
    this._didFocusSubscription = this.props.navigation.addListener('didFocus', this._loadData)
  }

  componentWillUnmount () {
    this._didFocusSubscription.remove()
  }

  _checkUnfreeze = async () => {
    const { freeze, publicKey } = this.props.context
    let unfreezeStatus = {
      msg: tl.t('freeze.unfreeze.inThreeDays'),
      disabled: false
    }
    const { balances } = freeze[publicKey]
    if (balances.length > 0) {
      const { expires: frozenExpiration } = balances[0]

      if (frozenExpiration > 0) {
        if (frozenExpiration < new Date().getTime()) {
          unfreezeStatus.msg = tl.t('freeze.unfreeze.now')
          unfreezeStatus.disabled = false
          return unfreezeStatus
        } else {
          unfreezeStatus.msg = `${tl.t('freeze.unfreeze.inXTime')} ${moment(frozenExpiration).fromNow()}`
          unfreezeStatus.disabled = true
          return unfreezeStatus
        }
      } else {
        return unfreezeStatus
      }
    }
  }

  _loadData = async () => {
    try {
      const { accounts, publicKey } = this.props.context
      const { tronPower } = accounts.find(account => account.address === publicKey)
      const unfreezeStatus = await this._checkUnfreeze()
      this.setState({
        loading: false,
        unfreezeStatus,
        total: tronPower
      })
    } catch (e) {
      logSentry(e, 'Freeze - Load Data')
      this.setState({ loading: false })
    }
  }

  _setPercentage = percentage => {
    const { getCurrentBalances } = this.props.context
    const { balance } = getCurrentBalances().find(bl => bl.id === '1') || { balance: 0 }
    const amountWanted = Math.floor(balance * percentage)
    this._changeFreeze(amountWanted.toString())
  }

  _submitUnfreeze = async () => {
    const { publicKey } = this.props.context
    this.setState({ loading: true })
    try {
      const data = await Client.getUnfreezeTransaction(publicKey, this.props.context.pin)
      this._openTransactionDetails(data)
      MixPanel.trackWithProperties('UnFreeze', {
        address: publicKey,
        amount: this.state.amount
      })
    } catch (e) {
      Alert.alert(tl.t('warning'), tl.t('error.buildingTransaction'))
      this.setState({ loadingSign: false })
      logSentry(e, 'Unfreeze - Submit')
    } finally {
      this.setState({ loading: false })
    }
  }

  _submit = async () => {
    const { accounts, publicKey } = this.props.context
    const { balance } = accounts.find(account => account.address === publicKey)
    const { amount } = this.state
    const convertedAmount = Number(amount)

    this.setState({ loading: true })
    try {
      if (convertedAmount <= 0) {
        throw new DataError(tl.t('freeze.error.minimiumAmount'))
      }
      if (balance < convertedAmount) {
        throw new DataError(tl.t('freeze.error.insufficientAmount'))
      }
      if (!Number.isInteger(convertedAmount)) {
        throw new DataError(tl.t('freeze.error.roundNumbers'))
      }
      this._freezeToken()
    } catch (error) {
      if (error.name === 'DataError') {
        Alert.alert(tl.t('warning'), error.message)
      } else {
        Alert.alert(tl.t('warning'), tl.t('error.default'))
        logSentry(error, 'Freeze - Submit')
      }
      this.setState({ loading: false })
    }
  }

  _freezeToken = async () => {
    const { amount } = this.state
    const convertedAmount = Number(amount)

    try {
      const data = await Client.getFreezeTransaction(this.props.context.publicKey, convertedAmount)
      this._openTransactionDetails(data)
      MixPanel.trackWithProperties('Freeze', {
        address: this.props.context.publicKey,
        amount
      })
    } catch (e) {
      Alert.alert(tl.t('warning'), tl.t('error.buildingTransaction'))
      logSentry(e, 'Freeze - Create Tx')
    } finally {
      this.setState({ loading: false })
    }
  }

  _openTransactionDetails = async transactionUnsigned => {
    try {
      const { accounts, publicKey, freeze } = this.props.context
      const totalFrozen = Math.floor(freeze[publicKey].total) * ONE_TRX
      const transactionSigned = await signTransaction(
        accounts.find(item => item.address === publicKey).privateKey,
        transactionUnsigned
      )
      this.setState({ loadingSign: false }, () => {
        replaceRoute(this.props.navigation, 'SubmitTransaction', {
          tx: transactionSigned,
          tokenAmount: totalFrozen
        })
      })
    } catch (e) {
      Alert.alert(tl.t('error.gettingTransaction'))
      this.setState({ loadingSign: false })
      logSentry(e, 'Freeze - Open Tx')
    }
  }

  _changeFreeze = value => {
    const validation = /^0[0-9]/
    let amount = validation.test(value) ? value.slice(1, value.length) : value
    this.setState({
      amount: amount
    })
  }

  _leftContent = () => (
    <Utils.View marginRight={8} marginLeft={8}>
      <FontelloIcon name='lock' size={12} color={Colors.secondaryText} />
    </Utils.View>
  )

  _getBalance = () => {
    const { accounts, publicKey } = this.props.context
    const currentBalance = accounts.find(account => account.address === publicKey)
    if (currentBalance) return currentBalance.balance
    else return 0
  }

  render () {
    const { amount, loading, unfreezeStatus } = this.state
    const { freeze, publicKey } = this.props.context
    const userTotalPower = freeze[publicKey] ? Number(freeze[publicKey].total) : 0
    const newTotalPower = userTotalPower + Number(amount.replace(/,/g, ''))
    const trxBalance = this._getBalance()

    return (
      <Utils.SafeAreaView>
        <KeyboardScreen>
          <NavigationHeader
            title={tl.t('freeze.title')}
            onBack={() => { this.props.navigation.goBack() }}
            noBorder
          />
          <Utils.Container>
            <Header>
              <Utils.View align='center'>
                <Utils.Text size='xsmall' secondary>
                  {tl.t('freeze.balance')}
                </Utils.Text>
                <Utils.VerticalSpacer size='medium' />
                <Utils.Row align='center'>
                  <Utils.Text size='large'>
                    {formatNumber(trxBalance)}
                  </Utils.Text>
                  <Utils.HorizontalSpacer />
                  <Badge>TRX</Badge>
                </Utils.Row>
              </Utils.View>
            </Header>
            <Utils.Content paddingTop={8}>
              <Input
                label={tl.t('freeze.amount')}
                leftContent={this._leftContent}
                keyboardType='numeric'
                align='right'
                value={amount}
                onChangeText={value => this._changeFreeze(value)}
                onSubmitEditing={() => Keyboard.dismiss()}
                placeholder='0'
                type='int'
                numbersOnly
              />
              <PercentageSelector
                options={PERCENTAGE_OPTIONS}
                onItemPress={this._setPercentage}
              />
              <Utils.VerticalSpacer size='small' />
              <Utils.SummaryInfo>
                {`${tl.t('tronPower')} ${formatNumber(newTotalPower)}`}
              </Utils.SummaryInfo>
              <Utils.VerticalSpacer size='medium' />
              <ButtonGradient
                font='bold'
                text={tl.t('freeze.title')}
                onPress={this._submit}
                disabled={loading || !(amount > 0 && amount <= trxBalance)}
              />
              <Utils.VerticalSpacer size='big' />
              <Utils.View align='center' justify='center'>
                <Utils.SummaryInfo>{unfreezeStatus.msg}</Utils.SummaryInfo>
                <Utils.VerticalSpacer size='medium' />
                <Utils.LightButton
                  paddingY={'medium'}
                  paddingX={'large'}
                  disabled={unfreezeStatus.disabled || loading || !userTotalPower}
                  onPress={this._submitUnfreeze}
                >
                  <Utils.Text size='xsmall'>
                    {tl.t('freeze.unfreeze.title')}
                  </Utils.Text>
                </Utils.LightButton>
              </Utils.View>
            </Utils.Content>
          </Utils.Container>
        </KeyboardScreen>
      </Utils.SafeAreaView>
    )
  }
}

export default withContext(FreezeScene)
