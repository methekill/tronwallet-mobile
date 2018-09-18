import React from 'react'
import { TouchableOpacity } from 'react-native'
import PropTypes from 'prop-types'
import Feather from 'react-native-vector-icons/Feather'

import { Spacing } from '../DesignSystem'

const ClearVotes = ({onPress, disabled, label}) => (
  <TouchableOpacity
    onPress={onPress}
    style={{
      justifyContent: 'center',
      alignItems: 'center',
      paddingLeft: Spacing.medium
    }}>
    <Feather name='trash-2' color='white' size={18} />
  </TouchableOpacity>
)

ClearVotes.defaultProps = {
  label: 0
}
ClearVotes.propTypes = {
  onPress: PropTypes.func.isRequired,
  label: PropTypes.number.isRequired

}
export default ClearVotes
