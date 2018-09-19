import React from 'react'
import { BackHandler, TouchableOpacity } from 'react-native'

import * as Utils from '../../components/Utils'
import { Colors } from '../../components/DesignSystem'
import tl from '../../utils/i18n'
// import Logo from '../../components/Logo'
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

  render () {
    const shouldDoubleCheck = this.props.navigation.getParam('shouldDoubleCheck')
    const testInput = this.props.navigation.getParam('testInput')
    return (
      <React.Fragment>
        <FeaturesSwiper />
        <Utils.Content background={Colors.background} padding={20}>
          <Utils.VerticalSpacer size='big' />
          <ButtonGradient
            text={tl.t('firstTime.button.create')}
            onPress={() => {
              this.props.navigation.navigate('Pin', {
                shouldDoubleCheck,
                testInput,
                onSuccess: async pin => {
                  this.props.context.setPin(
                    pin,
                    () => this.props.navigation.navigate('CreateSeed')
                  )
                }
              })
            }}
          />
          <Utils.VerticalSpacer />
          <ButtonGradient
            text={tl.t('firstTime.button.restore')}
            onPress={() => {
              this.props.navigation.navigate('Pin', {
                shouldDoubleCheck,
                testInput,
                onSuccess: pin => this.props.context.setPin(pin, () => this.props.navigation.navigate('SeedRestore'))
              })
            }}
          />
          <Utils.VerticalSpacer size='large' />
          <TouchableOpacity
            onPress={() => {
              this.props.navigation.navigate('Pin', {
                shouldDoubleCheck,
                testInput,
                onSuccess: pin => this.props.context.setPin(pin, () => this.props.navigation.navigate('ImportWallet'))
              })
            }}>
            <Utils.Text align='center' size='tiny'>
            RESTORE FROM PRIVATE KEY
            </Utils.Text>
          </TouchableOpacity>
          <Utils.VersionText>{`v${ConfigJson.version}`}</Utils.VersionText>
        </Utils.Content>
      </React.Fragment>
    )
  }
}

export default withContext(FirstTime)
