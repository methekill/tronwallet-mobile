import React from 'react'

import LottieView from 'lottie-react-native'
import { Colors } from './DesignSystem'
import * as Utils from './Utils'

export default () => {
  return (
    <Utils.View
      style={{ backgroundColor: Colors.background }}
      flex={1}
      justify='center'
      align='center'
    >
      <LottieView
        source={require('./../assets/animations/world_locations.json')}
        autoPlay
        loop
        style={{ width: 200, height: 200 }}
      />
    </Utils.View>
  )
}
