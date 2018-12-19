import React, { Component } from 'react'
import { Alert, Keyboard } from 'react-native'
import { Answers } from 'react-native-fabric'
import MixPanel from 'react-native-mixpanel'

// Design
import tl from '../../utils/i18n'
import {
  SafeAreaView,
  Container,
  Content,
  Text
} from '../../components/Utils'

// Components
import AddressInput from '../../components/Import/AddressInput'
import ImportButton from '../../components/Import/ImportButton'

// Utils
import { restoreFromPrivateKey } from '../../utils/secretsUtils'
import { redirectToApp } from '../../utils/routerUtils'
import { withContext } from '../../store/context'

class WatchImport extends Component {
  static navigationOptions = () => ({ title: tl.t('import.header.watch') })

  state = {
    address: '',
    loading: false,
    addressInvalid: false
  }

  _changeAddress = (address, error) =>
    this.setState({ address, addressInvalid: !!error })

  _submit = async () => {
    Keyboard.dismiss()

    this.setState({ loading: true })

    try {
      await this._importWallet()

      Answers.logCustom('Wallet Operation', { type: 'Import from PrivateKey' })
      MixPanel.trackWithProperties('Wallet Operation', { type: 'Import from PrivateKey' })
    } catch (error) {
      Alert.alert(tl.t('warning'), 'Address or private key not valid')
    } finally {
      this.setState({ loading: false })
    }
  }

  _importWallet = async () => {
    const { pin, oneSignalId, setSecretMode, loadUserData } = this.props.context
    const { address } = this.state

    await restoreFromPrivateKey(pin, oneSignalId, address)

    setSecretMode('watch')
    await loadUserData()

    redirectToApp(this.props.navigation)
  }

  _disableImport = () => {
    const { loading, address, addressInvalid } = this.state
    return loading || !address || addressInvalid
  }

  render () {
    const {
      loading
    } = this.state

    return (
      <SafeAreaView>
        <Container>
          <Content>
            <AddressInput
              innerRef={(input) => { this.address = input }}
              onChangeText={this._changeAddress}
              onSubmitEditing={() => this.privatekey.focus()}
            />
            <Text marginY={20} size='tiny' font='regular'>
              {tl.t('importWallet.message')}
            </Text>
            <ImportButton
              loading={loading}
              onPress={this._submit}
              disabled={this._disableImport()}
            />
          </Content>
        </Container>
      </SafeAreaView>
    )
  }
}

export default withContext(WatchImport)
