import React, { Component } from 'react'
import { View } from 'react-native'
import styled from 'styled-components'
import Communications from 'react-native-communications'

import { withContext } from '../../store/context'

import { Text } from '../../components/Utils'
import { Colors } from '../../components/DesignSystem'
import ButtonGradient from '../../components/ButtonGradient'

import { triggerSmartContract, signSmartContract, submitSmartContract } from '../../services/tronweb'
import { ONE_TRX } from '../../services/client'

import { replaceRoute } from '../../utils/navigationUtils'

const Card = styled.View`
  display: flex;
  flex: 0.9;
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
  padding-horizontal: 10%;
`

const ContractParams = styled.View`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: row;
  background-color: white;
  width: 80%;
  height: 15%;
  border-radius: 10px;
`

class ContractCard extends Component {
  submitContract = async () => {
    const account = this.selectAccount()
    const { address, amount, command, feeLimit, params, callbackUrl } = this.props.params

    const contract = {
      address,
      command,
      amount: amount * ONE_TRX,
      params,
      feeLimit,
      issuer: account.address
    }

    const TR = await triggerSmartContract(contract)
    const signedTR = await signSmartContract(TR.transaction, account.privateKey)
    const result = await submitSmartContract(signedTR)

    if (result) {
      this.props.navigation.navigate('TransactionSuccess', {
        stackToReset: 'ParticipateHome',
        nextRoute: 'Transactions'
      })

      if (callbackUrl) {
        return Communications.web(`${callbackUrl}?tx=${result.transaction.txID}`)
      }
    }
  }

  selectAccount = () => {
    const { accounts } = this.props.context
    return accounts.find(acc => acc.alias === '@main_account')
  }

  render () {
    const { amount, address, command, site } = this.props.params

    return (
      <Card>
        <Text style={{ 'marginBottom': '5%' }}>DApp Confirmation</Text>

        <Row>
          <Text>Site:</Text>
          <Text>{site}</Text>
        </Row>

        <Row>
          <Text>Contract:</Text>
          <Text>{`${address.slice(0, 4)}...${address.slice(-4)}`}</Text>
        </Row>

        <Row>
          <Text>Cost:</Text>
          <Text>{amount} TRX</Text>
        </Row>

        <ContractParams>
          <Text color='black'>{command}</Text>
        </ContractParams>

        <Row style={{ marginTop: 15 }}>
          <View style={{ flex: 1, marginRight: '5%' }}>
            <ButtonGradient width={'100%'} text='Reject' onClick={() => replaceRoute(this.props.navigation, 'Balance')} />
          </View>

          <View style={{ flex: 1, marginLeft: '5%' }}>
            <ButtonGradient width={'100%'} text='Confirm' onPress={this.submitContract} />
          </View>

        </Row>

      </Card>
    )
  }
}

export default withContext(ContractCard)
