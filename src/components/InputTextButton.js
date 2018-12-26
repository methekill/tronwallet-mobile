import React from 'react'

import * as Utils from './Utils'
import styled from 'styled-components'
import { Colors } from './DesignSystem'

const ButtonWrapper = styled.TouchableOpacity`
  height: 36px;
  width: 36px;
  border-radius: 4px;
  background-color: ${Colors.darkThree};
  align-items: center;
  justify-content: center;
  elevation: 2;
  shadow-color: ${Colors.shadow};
  shadow-offset: 0 2px;
  shadow-radius: 4px;
  shadow-opacity: 0.5;
`
const InputTextButton = ({text, onPress}) => (
  <ButtonWrapper onPress={onPress}>
    <Utils.Text color={Colors.secondaryText} size='tiny'>{text}</Utils.Text>
  </ButtonWrapper>
)

export default InputTextButton
