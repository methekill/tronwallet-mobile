import React from 'react'
import { ActivityIndicator, Alert, TouchableOpacity, Clipboard, Image } from 'react-native'
import { StackActions, NavigationActions } from 'react-navigation'
import RNTron from 'react-native-tron'
import Toast from 'react-native-easy-toast'
import MixPanel from 'react-native-mixpanel'

import { Colors, ScreenSize } from '../../components/DesignSystem'
import ButtonGradient from '../../components/ButtonGradient'
import NavigationHeader from '../../components/Navigation/Header'
import { MainCard, SeedInfo, SeedMessage, ButtonRow } from './elements'
import {
  Container,
  View,
  Text,
  Content,
  HorizontalSpacer,
  SafeAreaView,
  Button
} from '../../components/Utils'

import { createUserKeyPair } from '../../utils/secretsUtils'
import { withContext } from '../../store/context'
import { logSentry } from '../../utils/sentryUtils'
import tl from '../../utils/i18n'

import FontelloIcon from '../../components/FontelloIcon'

const resetAction = StackActions.reset({
  index: 0,
  actions: [NavigationActions.navigate({ routeName: 'App' })],
  key: null
})

class Create extends React.Component {
  static navigationOptions = () => ({ header: null })

  state = {
    seed: null,
    error: null,
    loading: false
  }

  componentDidMount () {
    this._getMnemonic()
  }

  _confirmSeed = async route => {
    const { navigation, context } = this.props
    const { seed } = this.state
    const { pin, oneSignalId } = context

    this.setState({ loading: true })
    try {
      await createUserKeyPair(pin, oneSignalId, seed)
      await context.loadUserData()
      if (route === 'app') {
        navigation.dispatch(resetAction)
      } else {
        navigation.navigate('SeedSave')
      }
      MixPanel.track('Confirm seed')
    } catch (e) {
      Alert.alert(tl.t('seed.create.error'))
      logSentry(e, 'Create Seed - Confirm')
    } finally {
      this.setState({ loading: false })
    }
  }

  _getMnemonic = async () => {
    try {
      const mnemonic = await RNTron.generateMnemonic()
      this.setState({ seed: mnemonic })
    } catch (e) {
      Alert.alert(tl.t('seed.create.error'))
      logSentry(e, 'Create Seed - Get mnemonic')
    }
  }

  _onCopySeed = async () => {
    try {
      await Clipboard.setString(this.state.seed)
      this.refs.toast.show(tl.t('receive.clipboardCopied'))
    } catch (error) {
      logSentry(error, 'Copy Seed - onCopy')
    }
  }

  _renderSkip = () => {
    if (this.state.loading) return null
    return (
      <TouchableOpacity onPress={() => this._confirmSeed('app')}>
        <Text size='button'>{tl.t('skip').toUpperCase()}</Text>
      </TouchableOpacity>
    )
  }

  render () {
    const { seed, loading } = this.state
    return (
      <SafeAreaView>
        <Container>
          <NavigationHeader
            title={tl.t('seed.create.title')}
            onBack={() => this.props.navigation.goBack()}
            rightButton={this._renderSkip()}
          />
          <Content flex={1} paddingSize='medium'>
            <MainCard>
              <View align='flex-end' justify='center' height={30} >
                <Button width={30} height={30} justify='center' onPress={this._onCopySeed} >
                  <FontelloIcon name='copy' size={14} color={Colors.greyBlue} />
                </Button>
              </View>
              <View height={32} />
              {seed
                ? (<Text size='small' lineHeight={24} align='center'>{seed}</Text>)
                : (<ActivityIndicator size='small' />)}
              <View height={ScreenSize.height * 0.1} />
              <View
                marginVertical={20}
                height={0.7}
                backgroundColor={Colors.dusk}
              />
              <ButtonRow>
                <ButtonGradient
                  size='large'
                  onPress={this._getMnemonic}
                  disabled={loading}
                  text={tl.t('seed.create.button.newSeed')}
                  secondary
                  full
                />
                <HorizontalSpacer size='large' />
                <ButtonGradient
                  size='large'
                  disabled={!seed || loading}
                  onPress={() => this._confirmSeed('confirm')}
                  text={tl.t('seed.create.button.written')}
                  full
                />
              </ButtonRow>
              <View height={20} />
              <SeedMessage>
                <Text
                  lineHeight={16}
                  align='center'
                  size='xsmall'
                  font='regular'
                >
                  {tl.t('seed.create.backupMessage')}
                </Text>
              </SeedMessage>
              <View height={20} />
            </MainCard>
            <View height={26} />
            <SeedInfo>
              <Image
                source={require('../../assets/icon-information.png')}
                style={{ height: 25 }}
                resizeMode='contain'
              />
              <Text
                size='tiny'
                font='regular'
                color={Colors.greyBlue}
                secondary
              >
                {tl.t('seed.create.seedExplanation')}
              </Text>
            </SeedInfo>
          </Content>
          <Toast
            ref='toast'
            position='bottom'
            fadeInDuration={750}
            fadeOutDuration={1000}
            opacity={0.8}
          />
        </Container>
      </SafeAreaView>
    )
  }
}

export default withContext(Create)
