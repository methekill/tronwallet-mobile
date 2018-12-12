import React, { Component } from 'react'
import SplashScreen from 'react-native-splash-screen'
import LottieView from 'lottie-react-native'

import * as Utils from '../../components/Utils'
import { Colors } from '../../components/DesignSystem'

class LoadingScene extends Component {
  async componentDidMount () {
    SplashScreen.hide()
    this.lottie.play()
  }

  componentWillUnmount () {
    if (this.lottie) {
      this.lottie.reset()
    }
  }

  render () {
    return (
      <Utils.View flex={1} align='center' justify='center' background={Colors.background} >
        <LottieView
          ref={ref => { this.lottie = ref }}
          source={require('./../../assets/animations/world_locations.json')}
          loop
          style={{ width: 200, height: 200 }}
        />
      </Utils.View>
    )
  }
}

export default LoadingScene
