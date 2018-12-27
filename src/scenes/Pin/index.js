import React, { Component } from 'react'
import { BackHandler, AsyncStorage, Alert } from 'react-native'
import Biometrics from 'react-native-biometrics'

import { GoBackButton, Label, Text, BiometricButton } from './elements'
import PinPad from './PinPad'

import tl from '../../utils/i18n'
import Async from './../../utils/asyncStorageUtils'
import { decrypt } from '../../utils/encrypt'
import * as Utils from '../../components/Utils'

import { USE_BIOMETRY, ENCRYPTED_PIN } from '../../utils/constants'

class PinScene extends Component {
  state = {
    isDoubleChecking: false,
    pin: null,
    biometricsEnabled: false
  }

  componentDidMount () {
    this.backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      const shouldGoBack = this.props.navigation.getParam('shouldGoBack', false)
      if (shouldGoBack) {
        this.props.navigation.goBack()
      }
      return true
    })

    this.didFocusEvent = this.props.navigation.addListener('didFocus', this._didFocus)
  }

  componentWillUnmount () {
    this.backHandler.remove()
    this.didFocusEvent.remove()
  }

  _didFocus = async () => {
    const useBiometrySetting = await Async.get(USE_BIOMETRY, false)
    if (useBiometrySetting === 'true') {
      Biometrics.isSensorAvailable()
        .then(async (biometryType) => {
          if (biometryType === Biometrics.TouchID || biometryType === Biometrics.FaceID) {
            this.setState({ biometricsEnabled: true }, this._handleBiometrics)
          }
        })
    }
  }

  _onSubmit = async (currentPin) => {
    const testInput = this.props.navigation.getParam('testInput')
    const onSuccess = this.props.navigation.getParam('onSuccess')
    if (testInput) {
      const result = await testInput(currentPin)
      if (result) {
        this.props.navigation.goBack(null)
        if (onSuccess) {
          if (this.pinPad) {
            this.pinPad.reset()
          }
          onSuccess(currentPin)
        }
      } else {
        if (this.pinPad) {
          this.pinPad.reset()
          this.pinPad.shake()
        }
      }
    }
  }

  _resetState = () => {
    this.setState({ isDoubleChecking: false, pin: null })
  }

  _handleBiometrics = async () => {
    try {
      const signature = await Biometrics.createSignature(tl.t('biometry.register.title'), '')
      const currentPIN = await AsyncStorage.getItem(ENCRYPTED_PIN)
      const decryptPIN = decrypt(currentPIN, signature)
      this._onSubmit(decryptPIN)
    } catch (error) {
      Alert.alert(tl.t('biometry.auth.error'))
    }
  }

  _doubleCheckPin = (currentPin) => {
    if (this.state.pin === null) {
      this.setState({ pin: currentPin, isDoubleChecking: true })
      this.pinPad.reset()
    } else if (this.state.pin === currentPin) {
      this._onSubmit(currentPin)
    } else {
      this.pinPad.reset()
      this.pinPad.shake()
    }
  }

  _singleCheckPIN = (currentPin) => {
    this._onSubmit(currentPin)
  }

  _checkPIN = (pin) => {
    const shouldDoubleCheck = this.props.navigation.getParam('shouldDoubleCheck', false)
    if (shouldDoubleCheck) {
      this._doubleCheckPin(pin)
    } else {
      this._singleCheckPIN(pin)
    }
  }

  _renderTitle = () => {
    const { isDoubleChecking } = this.state
    const shouldDoubleCheck = this.props.navigation.getParam('shouldDoubleCheck', false)

    if (isDoubleChecking) {
      return tl.t('pin.reenter')
    } else if (shouldDoubleCheck) {
      return tl.t('pin.new')
    }

    return tl.t('pin.enter')
  }

    _renderBiometrics = () => {
      const { biometricsEnabled } = this.state

      if (biometricsEnabled) {
        return (
          <BiometricButton onPress={this._handleBiometrics}>
            <Text>{tl.t('pin.biometrics')}</Text>
          </BiometricButton>
        )
      }

      return null
    }

    render () {
      const shouldGoBack = this.props.navigation.getParam('shouldGoBack', false)
      return (
        <Utils.SafeAreaView>
          <Utils.Container >
            <Utils.Content flex={1}>
              {this.state.isDoubleChecking && (
                <GoBackButton onPress={this._resetState} />
              )}
              {shouldGoBack && (
                <GoBackButton onPress={() => this.props.navigation.goBack()} />
              )}
              <Utils.View align='center'>
                <Label>{tl.t('pin.title')}</Label>
                <Utils.VerticalSpacer />
                <Text>{this._renderTitle()}</Text>
              </Utils.View>
            </Utils.Content>
            <PinPad ref={ref => { this.pinPad = ref }} onComplete={this._checkPIN} />
            <Utils.View flex={0.4} paddingY='medium' justify='center' align='center'>
              {this._renderBiometrics()}
            </Utils.View>
          </Utils.Container>
        </Utils.SafeAreaView >
      )
    }
}

export default PinScene
