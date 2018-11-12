import React, { PureComponent } from 'react'

import LottieView from 'lottie-react-native'
import { Colors } from './DesignSystem'
import * as Utils from './Utils'

export default class LoadingScene extends PureComponent {
  componentDidMount () {
    this.lottie.play()
  }

  componentWillUnmount () {
    this.lottie.reset()
  }

  render () {
    return (
      <Utils.View style={{ backgroundColor: Colors.background }} flex={1} justify='center' align='center' >
        <LottieView
          ref={ref => { this.lottie = ref }}
          source={require('./../assets/animations/world_locations.json')}
          loop
          style={{ width: 200, height: 200 }}
        />
      </Utils.View>
    )
  }
}
