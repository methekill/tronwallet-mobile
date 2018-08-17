import React, { Component } from 'react'
import { ActivityIndicator, AsyncStorage } from 'react-native'
import SplashScreen from 'react-native-splash-screen'

import * as Utils from '../../components/Utils'
import { Colors } from '../../components/DesignSystem'

import { updateAssets } from '../../utils/assetsUtils'
import SecretStore from '../../store/secrets'
import { withContext } from '../../store/context'
import { USER_STATUS, USER_FILTERED_TOKENS } from '../../utils/constants'

class LoadingScene extends Component {
  async componentDidMount () {
    await updateAssets(0, 1, 'twx')
    await this._setFilteredTokens()
    SplashScreen.hide()
    this._askPin()
  }

  _getUseStatus = async () => {
    const useStatus = await AsyncStorage.getItem(USER_STATUS)
    if (useStatus === null || useStatus === 'reset') {
      return useStatus || true
    } else {
      return false
    }
  }

  _setFilteredTokens = async () => {
    const filteredTokens = await AsyncStorage.getItem(USER_FILTERED_TOKENS)
    if (filteredTokens === null) {
      await AsyncStorage.setItem(USER_FILTERED_TOKENS, '[]')
    }
  }

  _tryToOpenStore = async pin => {
    try {
      await SecretStore(pin)
      return true
    } catch (err) {
      return false
    }
  }

  _handleSuccess = key => {
    this.props.context.setPin(key, () => this.props.navigation.navigate('App'))
  }

  _askPin = async () => {
    const useStatus = await this._getUseStatus()
    if (useStatus) {
      const shouldDoubleCheck = useStatus !== 'reset'
      this.props.navigation.navigate('FirstTime', {
        shouldDoubleCheck,
        testInput: this._tryToOpenStore
      })
    } else {
      this.props.navigation.navigate('Pin', {
        testInput: this._tryToOpenStore,
        onSuccess: this._handleSuccess
      })
    }
  }

  render () {
    return (
      <Utils.View
        flex={1}
        align='center'
        justify='center'
        background={Colors.background}
      >
        <ActivityIndicator />
      </Utils.View>
    )
  }
}

export default withContext(LoadingScene)
