import React from 'react'
import { TouchableOpacity } from 'react-native'
import Ionicons from 'react-native-vector-icons/Ionicons'
import { func } from 'prop-types'

import { Colors } from '../DesignSystem'
import { View } from '../Utils'

const LeftBackButton = ({ onBack }) => (
  <View margin={5} position='absolute' left={10}>
    <TouchableOpacity style={{ padding: 12 }} onPress={onBack} testID='HeaderBack'>
      <Ionicons
        name='ios-arrow-round-back'
        size={36}
        color={Colors.primaryText}
      />
    </TouchableOpacity>
  </View>
)

LeftBackButton.propTypes = {
  onBack: func
}

export default LeftBackButton
