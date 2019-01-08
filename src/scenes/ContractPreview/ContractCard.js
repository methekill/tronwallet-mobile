import React, { Component } from 'react'
import { View } from 'react-native'
import styled from 'styled-components'

import { withContext } from '../../store/context'

import { Colors } from '../../components/DesignSystem'
import ButtonGradient from '../../components/ButtonGradient'
import { AutoSignSelector } from './elements'

import { signSmartContract } from '../../services/tronweb'
import { ONE_TRX } from '../../services/client'
import { Button, Text } from '../../components/Utils'

import tl from '../../utils/i18n'

const Card = styled.View`
  display: flex;
  flex: 0.6;
  align-self: center;
  width: 100%;
  background-color: ${Colors.dusk};
  border-radius: 10px;
  align-items: center;
  justify-content: center;
`

const Row = styled.View`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  height: 11%;
  background-color: transparent;
  padding-horizontal: ${({ noPadding }) => noPadding ? '0%' : '10%'};
`

const Line = styled(Row)`
  width: 80%;
  height: 2px;
  backgroundColor: ${Colors.slateGrey};
`

const RejectButton = styled(Button)`
  border-radius: 4px;
  height: 100%;
  width: 100%;
`

// const ContractParams = styled.View`
//   display: flex;
//   justify-content: center;
//   align-items: center;
//   flex-direction: row;
//   background-color: white;
//   width: 80%;
//   height: 15%;
//   border-radius: 10px;
// `

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

        <Row style={{ marginTop: 15 }}>
          <View style={{ flex: 0.4, marginRight: '1%' }}>
            <RejectButton backgroundColor={Colors.greyBlue} text={tl.t('contract.button.reject')} onPress={this.rejectTR} textSize='tiny'>
              <Text size='button'>{tl.t('contract.button.reject')}</Text>
            </RejectButton>
          </View>

          <View style={{ flex: 0.6, marginLeft: '1%' }}>
            <ButtonGradient width={'100%'} text={tl.t('contract.button.confirm')} onPress={this.submitContract} />
          </View>
        </Row>

        <Row noPadding>
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
