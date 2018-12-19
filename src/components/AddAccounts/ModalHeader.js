import React from 'react'
import { func, string } from 'prop-types'

import { View, Text } from '../Utils'
import FontelloButton from '../FontelloButton'
import { Colors } from '../DesignSystem'

const ModalHeader = ({ onClose, title }) => (
  <View align='center' vertical marginTop={15} marginBottom={20}>
    <View flex={1} marginBottom={3}>
      <FontelloButton onPress={onClose} name='close' size={13} />
    </View>
    <View flex={2} align='center'>
      <Text color={Colors.greyBlue}>{title}</Text>
    </View>
    <View flex={1} />
  </View>
)

ModalHeader.propTypes = {
  onClose: func,
  title: string.isRequired
}

ModalHeader.defaultProps = {
  onClose: () => {}
}

export default ModalHeader
