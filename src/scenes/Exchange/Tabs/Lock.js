import React from 'react'
import { TouchableOpacity } from 'react-native'
import PropTypes from 'prop-types'

import * as Utils from '../../../components/Utils'
import { Colors } from '../../../components/DesignSystem'
import FontelloIcon from '../../../components/FontelloIcon'

const LockPin = ({locked, onPress}) => (
  <TouchableOpacity style={{padding: 8}} onPress={onPress}>
    <FontelloIcon
      name='lock,-secure,-safety,-safe,-protect'
      size={20}
      color={Colors.greyBlue}
    />
    {locked &&
      <Utils.View position='absolute' left='60%' top='48%'>
        <FontelloIcon
          name='check'
          color={Colors.weirdGreen}
          size={15}
        />
      </Utils.View >}
  </TouchableOpacity>
)

LockPin.propTypes = {
  onPress: PropTypes.func.isRequired,
  locked: PropTypes.bool.isRequired
}

export default LockPin
