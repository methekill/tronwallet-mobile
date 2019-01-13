import React, { Component } from 'react'
import { View } from 'react-native'

import { withContext } from '../../store/context'

import { Colors } from '../../components/DesignSystem'
import ButtonGradient from '../../components/ButtonGradient'
import { AutoSignSelector, Card, Row, Line, RejectButton } from './elements'

import { signSmartContract } from '../../services/tronweb'
import { ONE_TRX } from '../../services/client'
import { Text } from '../../components/Utils'

import tl from '../../utils/i18n'

const options = [
  { text: tl.t('contract.signMessage'), value: null },
  { text: `5 ${tl.t('contract.time')}`, value: 300000 },
  { text: `10 ${tl.t('contract.time')}`, value: 600000 }
]

class ContractCard extends Component {
  state = {
    autoSign: options[0]
  }

  submitContract = async () => {
    const account = this.selectAccount()
    const { closeDialog, params } = this.props
    const { tx: TR, cb } = params

    const signedTR = await signSmartContract(TR, account.privateKey)
    // Set autosign to X time

    closeDialog()
    cb(signedTR)
  }

  selectAccount = () => {
    const { getCurrentAccount } = this.props.context
    const currentAccount = getCurrentAccount()
    return currentAccount
  }

  rejectTR = () => {
    const { closeDialog, params: { cb } } = this.props
    closeDialog()
    cb(null)
  }

  render () {
    const { params } = this.props
    const { amount, address, site } = params
    const { autoSign } = this.state

    return (
      <Card>
        <Text style={{ 'marginBottom': '5%' }}>{tl.t('contract.confirmationTitle')}</Text>

        <Row>
          <Text size='smaller' color={Colors.greyBlue}>{tl.t('contract.siteLabel')}:</Text>
          <Text size='xsmall' font='light'>{site}</Text>
        </Row>

        <Row>
          <Text size='smaller' color={Colors.greyBlue}>{tl.t('contract.contractLabel')}:</Text>
          <Text size='xsmall' font='light'>{`${address.slice(0, 4)}...${address.slice(-4)}`}</Text>
        </Row>

        <Row>
          <Text size='smaller' color={Colors.greyBlue}>{tl.t('contract.costLabel')}:</Text>
          <Text>{amount / ONE_TRX} TRX</Text>
        </Row>

        {/* <ContractParams>
          <Text color='black'>{command}</Text>
        </ContractParams> */}

        <Line />

        <Row style={{ marginTop: 15, marginBottom: 15 }}>
          <View style={{ flex: 0.5, marginRight: '1%' }}>
            <RejectButton backgroundColor={Colors.greyBlue} text={tl.t('contract.button.reject')} onPress={this.rejectTR} textSize='tiny'>
              <Text size='button'>{tl.t('contract.button.reject')}</Text>
            </RejectButton>
          </View>

          <View style={{ flex: 0.5, marginLeft: '1%' }}>
            <ButtonGradient size='large' text={tl.t('contract.button.confirm')} onPress={this.submitContract} />
          </View>
        </Row>

        <Line />
        <Row style={{ marginTop: 15 }}>
          <AutoSignSelector
            options={options}
            autoSign={autoSign}
            onChange={(autoSign) => this.setState({ autoSign })}
          />
        </Row>

      </Card>
    )
  }
}

export default withContext(ContractCard)
