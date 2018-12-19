import React from 'react'
import { Alert, Keyboard } from 'react-native'
import { Answers } from 'react-native-fabric'
import MixPanel from 'react-native-mixpanel'

import tl from '../../utils/i18n'
import {
  SafeAreaView,
  Container,
  Content,
  Text
} from '../../components/Utils'
import ImportButton from '../../components/Import/ImportButton'

import { resetWalletData } from '../../utils/userAccountUtils'
import { recoverUserKeypair } from '../../utils/secretsUtils'
import { withContext } from '../../store/context'
import { logSentry } from '../../utils/sentryUtils'
import MnemonicInput from '../../components/Import/MnemonicInput'
import { redirectToApp } from '../../utils/routerUtils'

class MnemonicImport extends React.Component {
  static navigationOptions = () => ({
    title: tl.t('import.header.mnemonic')
  })

  state = {
    seed: '',
    loading: false
  }

  _confirmSubmit = () => {
    Alert.alert(
      tl.t('warning'),
      tl.t('seed.restore.warning'),
      [
        { text: tl.t('cancel') },
        { text: tl.t('ok'), onPress: this._submit }
      ],
      { cancelable: false }
    )
  }

  _submit = async () => {
    Keyboard.dismiss()

    this.setState({ loading: true })

    try {
      await this._importWallet()

      Alert.alert(tl.t('seed.restore.success'))

      Answers.logCustom('Wallet Operation', { type: 'MnemonicImport' })
      MixPanel.trackWithProperties('Wallet Operation', { type: 'MnemonicImport' })
    } catch (err) {
      Alert.alert(tl.t('warning'), tl.t('seed.restore.error'))
      if (err.code !== 'WordNotFoundExcpetion') {
        logSentry(err, 'MnemonicImport Seed')
      }
    } finally {
      this.setState({ loading: false })
    }
  }

  _importWallet = async () => {
    const { loadUserData, pin, oneSignalId } = this.props.context
    const seed = this.state.seed.trim()

    await this._softResetData()
    await recoverUserKeypair(pin, oneSignalId, seed)

    await loadUserData()

    redirectToApp(this.props.navigation)
  }

  _softResetData = async () => {
    const { resetAccount, setSecretMode } = this.props.context

    await resetWalletData()
    resetAccount()
    setSecretMode('mnemonic')
  }

  render () {
    const { seed, loading } = this.state
    return (
      <SafeAreaView>
        <Container>
          <Content>
            <MnemonicInput
              onChangeText={seed => this.setState({ seed })}
              onEnter={this._confirmSubmit}
            />
            <Text marginY={20} size='tiny' font='regular'>
              {tl.t('seed.restore.explanation')}
            </Text>
            <ImportButton
              loading={loading}
              onPress={this._confirmSubmit}
              disabled={!seed.length || loading}
            />
          </Content>
        </Container>
      </SafeAreaView>
    )
  }
}

export default withContext(MnemonicImport)
