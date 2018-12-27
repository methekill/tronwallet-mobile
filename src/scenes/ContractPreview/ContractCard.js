import React, { Component } from 'react'
import { View, Alert } from 'react-native'
import styled from 'styled-components'

import { withContext } from '../../store/context'

import { Text } from '../../components/Utils'
import { Colors } from '../../components/DesignSystem'
import ButtonGradient from '../../components/ButtonGradient'

import { signSmartContract, submitSmartContract } from '../../services/tronweb'
import { ONE_TRX } from '../../services/client'

import { AutoSignSelector } from './elements'

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
  padding-horizontal: ${({ noPadding }) => noPadding ? '0%' : '10%'};
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
  { text: 'Don\'t sign automatically', value: null },
  { text: '5 minutes', value: 300000 },
  { text: '10 minutes', value: 600000 }
]

class ContractCard extends Component {
  state = {
    autoSign: options[0]
  }

  submitContract = async () => {
    const account = this.selectAccount()
    const { tx: TR } = this.props.params

    const signedTR = await signSmartContract(TR, account.privateKey)
    const result = await submitSmartContract(signedTR)

    if (result && result.code !== 'CONTRACT_VALIDATE_ERROR') {
      // Set autosign to X time

      this.props.navigation.navigate('TransactionSuccess', {
        stackToReset: 'ParticipateHome',
        nextRoute: 'TronWebview'
      })

      // if (callbackUrl) {
      //   return Communications.web(`${callbackUrl}?tx=${result.transaction.txID}`)
      // }
    } else {
      this.props.navigation.navigate('TronWebview')
      Alert.alert('Failed while trying to submit this contract')
    }
  }

  selectAccount = () => {
    const { accounts } = this.props.context
    return accounts.find(acc => acc.alias === '@main_account')
  }

  render () {
    const { autoSign } = this.state
    const { amount, address, site } = this.props.params

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
          <Text>{amount / ONE_TRX} TRX</Text>
        </Row>

        {/* <ContractParams>
          <Text color='black'>{command}</Text>
        </ContractParams> */}

        <Row style={{ marginTop: 15 }}>
          <View style={{ flex: 1, marginRight: '5%' }}>
            <ButtonGradient width={'100%'} text='Reject' onPress={() => this.props.navigation.goBack()} />
          </View>

          <View style={{ flex: 1, marginLeft: '5%' }}>
            <ButtonGradient width={'100%'} text='Confirm' onPress={this.submitContract} />
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
