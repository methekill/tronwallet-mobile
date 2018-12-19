import React from 'react'
import { BackHandler } from 'react-native'
import Mixpanel from 'react-native-mixpanel'

import * as Utils from '../../components/Utils'
import { Colors } from '../../components/DesignSystem'
import { BlackButton } from './elements'
import tl from '../../utils/i18n'
import ButtonGradient from '../../components/ButtonGradient'
import { withContext } from '../../store/context'
import FeaturesSwiper from './FeaturesSwiper'
import ConfigJson from '../../../package.json'

class FirstTime extends React.Component {
  componentDidMount () {
    BackHandler.addEventListener('hardwareBackPress', this._handleBackPress)
  }

  componentWillUnmount () {
    BackHandler.removeEventListener('hardwareBackPress', this._handleBackPress)
  }

  _handleBackPress = () => {
    BackHandler.exitApp()
  }

  _handlePinSuccess = (scene) => {
    this.props.navigation.navigate(scene)
    Mixpanel.track(`Navigation to ${scene} scene`)
  }

  _navigateToCreateWalletScene = () => {
    const { context, navigation } = this.props
    const shouldDoubleCheck = navigation.getParam('shouldDoubleCheck')
    const testInput = navigation.getParam('testInput')

    this._navigate({
      shouldDoubleCheck,
      testInput,
      onSuccess: pin => {
        context.setPin(pin, () => this._handlePinSuccess('CreateSeed'))
      }
    })
  }

  _navigateToImportScene = () => {
    const { context, navigation } = this.props
    const shouldDoubleCheck = navigation.getParam('shouldDoubleCheck')
    const testInput = navigation.getParam('testInput')

    this._navigate({
      shouldDoubleCheck,
      testInput,
      onSuccess: pin => {
        context.setPin(pin, () => this._handlePinSuccess('ImportWallet'))
      }
    })
  }

  _navigate = (navigationProps) => {
    this.props.navigation.navigate('Pin', navigationProps)
  }

  render () {
    return (
      <React.Fragment>
        <FeaturesSwiper />
        <Utils.View background={Colors.background} paddingHorizontal={30}>
          <Utils.View height={20} />
          <ButtonGradient text={tl.t('firstTime.button.create')} onPress={this._navigateToCreateWalletScene} />
          <Utils.VerticalSpacer />
          <BlackButton text={tl.t('firstTime.button.import')} onPress={this._navigateToImportScene} />
          <Utils.VerticalSpacer />
          <Utils.VersionText>{`v${ConfigJson.version}`}</Utils.VersionText>
        </Utils.View>
      </React.Fragment>
    )
  }
}

export default withContext(FirstTime)
