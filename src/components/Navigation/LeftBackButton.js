import React from 'react'
import Ionicons from 'react-native-vector-icons/Ionicons'
import { func } from 'prop-types'
import { TouchableOpacity } from 'react-native'

import { Colors } from '../DesignSystem'

const LeftBackButton = ({ onBack }) => (
  <TouchableOpacity style={{padding: 8, position: 'absolute', left: 20, top: 20}} onPress={onBack} testID='HeaderBack'>
    <Ionicons
      name='ios-arrow-round-back'
      size={36}
      color={Colors.primaryText}
    />
  </TouchableOpacity>
)

LeftBackButton.propTypes = {
  onBack: func
}

export default LeftBackButton
