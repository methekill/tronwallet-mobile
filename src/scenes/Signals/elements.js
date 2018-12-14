import * as React from 'react'
import styled from 'styled-components'
import Feather from 'react-native-vector-icons/Feather'
import { Colors } from './../../components/DesignSystem'

import * as Utils from './../../components/Utils'

export const ModalContainer = styled(Utils.View).attrs({
  align: 'center',
  justify: 'center'
})`
  padding: 15px;
  border-color: ${Colors.primaryText};
  border-radius: 5px;
  max-width: 70%;
  min-width: 120px;
  background-color: ${Colors.background};
`

export const CloseIcon = styled(Feather).attrs({
  name: 'x',
  color: 'white',
  size: 16
})``

const Button = styled.TouchableOpacity`
  width: 40px;
  height: 40px;
  position: absolute;
  right: 0px;
  top: 0px;
  justify-content: center;
  align-content: center;
  align-items: center;
`

export const CloseButton = ({ onPress }) => (
  <Button onPress={onPress}><CloseIcon /></Button>
)
