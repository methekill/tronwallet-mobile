import React from 'react'
import PropTypes from 'prop-types'

import { CancelButton } from './CancelButton/elements'
import { Text } from './Utils'
import { Colors } from './DesignSystem'

const TransparentButton = ({ title, onPress }) => (
  <CancelButton onPress={onPress}>
    <Text size='xsmall' color={Colors.greyBlue}>{title}</Text>
  </CancelButton>
)

TransparentButton.propTypes = {
  onPress: PropTypes.func,
  title: PropTypes.string
}

export default TransparentButton
