import React from 'react'
import Ionicons from 'react-native-vector-icons/Ionicons'
import { func } from 'prop-types'

import { Colors } from '../DesignSystem'
import { LeftBackButtonTouchable } from './styles'

const LeftBackButton = ({ onBack }) => (
  <LeftBackButtonTouchable onPress={onBack} testID='HeaderBack'>
    <Ionicons
      name='ios-arrow-round-back'
      size={36}
      color={Colors.primaryText}
    />
  </LeftBackButtonTouchable>
)

LeftBackButton.propTypes = {
  onBack: func
}

export default LeftBackButton
