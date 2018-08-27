import React from 'react'
import { ActivityIndicator, Alert } from 'react-native'
import { StackActions, NavigationActions } from 'react-navigation'
import RNTron from 'react-native-tron'

import tl from '../../utils/i18n'
import * as Utils from '../../components/Utils'
import { Colors } from '../../components/DesignSystem'
import ButtonGradient from '../../components/ButtonGradient'
import NavigationHeader from '../../components/Navigation/Header'

import { recoverUserKeypair } from '../../utils/secretsUtils'
import { withContext } from '../../store/context'

const resetAction = StackActions.reset({
  index: 0,
  actions: [NavigationActions.navigate({ routeName: 'App' })],
  key: null
})

class Create extends React.Component {
  static navigationOptions = ({ navigation }) => ({
    header: (
      <NavigationHeader
        title='CREATE SEED'
        onBack={() => navigation.goBack()}
      />
    )
  })

  state = {
    seed: null,
    error: null,
    loading: false
  }

  componentDidMount () {
    this._getMnemonic()
  }

  _confirmSeed = async (route) => {
    const { navigation, context } = this.props
    const { seed } = this.state
    const { pin, oneSignalId } = context

    this.setState({loading: true})
    try {
      await recoverUserKeypair(pin, oneSignalId, seed)
      await context.loadUserData()
      if (route === 'app') navigation.dispatch(resetAction)
      else navigation.navigate('SeedConfirm', { seed: seed.split(' '), shouldReset: true })
    } catch (error) {
      Alert.alert(tl.t('seed.create.error'))
    } finally {
      this.setState({loading: false})
    }
  }

  _getMnemonic = async () => {
    try {
      const mnemonic = await RNTron.generateMnemonic()
      this.setState({ seed: mnemonic })
    } catch (e) {
      Alert.alert(tl.t('seed.create.error'))
    }
  }

  render () {
    const { seed, loading } = this.state
    return (
      <Utils.Container>
        <Utils.View flex={0.5} />
        <Utils.View height={1} backgroundColor={Colors.secondaryText} />
        <Utils.Content backgroundColor={Colors.darkerBackground}>
          {seed ? (
            <Utils.Text lineHeight={24} align='center'>
              {seed}
            </Utils.Text>)
            : <ActivityIndicator size='small' />}
        </Utils.Content>
        <Utils.View height={1} backgroundColor={Colors.secondaryText} />
        <Utils.Content paddingBottom={2}>
          <Utils.Row justify='center' align='flex-start' height={60}>
            <Utils.View style={{flex: 1}}>
              <ButtonGradient
                onPress={this._getMnemonic}
                disabled={loading}
                text={tl.t('seed.create.button.newSeed')}
                secondary
                full
              />
            </Utils.View>
            <Utils.HorizontalSpacer size='large' />
            <ButtonGradient
              disabled={!seed || loading}
              onPress={() => this._confirmSeed('confirm')}
              text={tl.t('seed.create.button.written')}
              full
            />
          </Utils.Row>
        </Utils.Content>
        <Utils.VerticalSpacer size='big' />
        <Utils.View align='center' paddingX='medium'>
          <Utils.Text marginY={10} font='regular' size='smaller' secondary>You can always check your words inside the app using the Backup option</Utils.Text>
          <Utils.Text
            text='SKIP'
            onPress={() => this._confirmSeed('app')}
            marginY={10}
            size='average'
          >SKIP</Utils.Text>

        </Utils.View>
      </Utils.Container>
    )
  }
}

export default withContext(Create)
