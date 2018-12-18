import React from 'react'
import Ionicons from 'react-native-vector-icons/Ionicons'
import { func } from 'prop-types'
import { TouchableOpacity } from 'react-native'

import { Colors } from '../DesignSystem'

const LeftCloseButton = ({ onBack, zIndex }) => (
  <TouchableOpacity style={{padding: 8, position: 'absolute', left: 20, top: 20, zIndex}} onPress={onBack} testID='HeaderBack'>
    <Ionicons
      name='ios-close'
      size={36}
      color={Colors.primaryText}
    />
  </TouchableOpacity>
)

LeftCloseButton.defaultProps = {
  zIndex: null
}

LeftCloseButton.propTypes = {
  onBack: func
}

export default LeftCloseButton
