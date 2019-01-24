import React from 'react'
import { Alert, Keyboard } from 'react-native'
import { StackActions, NavigationActions } from 'react-navigation'
import { Answers } from 'react-native-fabric'
import RNTron from 'react-native-tron'
import MixPanel from 'react-native-mixpanel'

import tl from '../../utils/i18n'
import * as Utils from '../../components/Utils'
import ButtonGradient from '../../components/ButtonGradient'
import NavigationHeader from '../../components/Navigation/Header'

import { resetWalletData } from '../../utils/userAccountUtils'
import { recoverUserKeypair } from '../../utils/secretsUtils'
import { withContext } from '../../store/context'
import { logSentry } from '../../utils/sentryUtils'

class Restore extends React.Component {
  state = {
    seed: '',
    loading: false
  }

  _navigateToFirstTime = () => {
    const resetAction = StackActions.reset({
      index: 0,
      actions: [NavigationActions.navigate({ routeName: 'App' })],
      key: null
    })
    this.props.navigation.dispatch(resetAction)
  }

  _handleRestore = () => {
    Alert.alert(
      tl.t('warning'),
      tl.t('seed.restore.warning'),
      [
        { text: tl.t('cancel') },
        { text: tl.t('ok'), onPress: this._restoreWallet }
      ],
      { cancelable: false }
    )
  }

  _restoreWallet = async () => {
    const { pin, oneSignalId } = this.props.context
    const seed = this.state.seed.trim()

    Keyboard.dismiss()
    this.setState({ loading: true })
    try {
      await RNTron.validateMnemonic(seed)
      await this._softResetData()
      await recoverUserKeypair(pin, oneSignalId, seed)
      Alert.alert(tl.t('seed.restore.success'))
      this.setState({ loading: false }, this._navigateToFirstTime)
      Answers.logCustom('Wallet Operation', { type: 'Restore' })
      MixPanel.track('Restore wallet')
    } catch (err) {
      Alert.alert(tl.t('warning'), tl.t('seed.restore.error'))
      this.setState({ loading: false })
      if (err.code !== 'WordNotFoundExcpetion') {
        logSentry(err, 'Restore Seed')
      }
    }
  }

  _softResetData = async () => {
    const { resetAccount, setSecretMode } = this.props.context
    await resetWalletData()
    resetAccount()
    setSecretMode('mnemonic')
  }

  _onKeyPress = event => {
    if (event.nativeEvent.key === 'Enter') {
      this._handleRestore()
    }
  }

  render () {
    const { loading } = this.state
    return (
      <Utils.SafeAreaView>
        <Utils.Container>
          <NavigationHeader
            title={tl.t('seed.restore.title')}
            onBack={() => this.props.navigation.goBack()}
            noBorder
          />
          <Utils.Content paddingBottom='2'>
            <Utils.FormInput
              testID='restoreInput'
              placeholder={tl.t('seed.restore.placeholder')}
              height={90}
              padding={16}
              multiline
              underlineColorAndroid='transparent'
              blurOnSubmit
              numberOfLines={4}
              autoCapitalize='none'
              autoCorrect={false}
              value={this.state.seed}
              onChangeText={seed => this.setState({ seed })}
              onKeyPress={this._onKeyPress}
            />
          </Utils.Content>
          <Utils.Content paddingTop='2' paddingBottom='4'>
            <ButtonGradient
              testID='RestoreButton'
              disabled={!this.state.seed.length || loading}
              onPress={this._handleRestore}
              text={tl.t('seed.restore.button')}
            />
          </Utils.Content>
          <Utils.Content paddingTop='8'>
            <Utils.Text weight='300' font='light' secondary size='smaller'>
              {tl.t('seed.restore.explanation')}
            </Utils.Text>
          </Utils.Content>
          <Utils.VerticalSpacer />
          <Utils.View flex={1} />
        </Utils.Container>
      </Utils.SafeAreaView>
    )
  }
}

export default withContext(Restore)
