import React from 'react'
import {
  ButtonWrapper,
  Button,
  ButtonText
} from './elements'

const FloatingButton = ({text, onPress}) => (
  <ButtonWrapper elevation={5}>
    <Button onPress={onPress}>
      <ButtonText>{text}</ButtonText>
    </Button>
  </ButtonWrapper>
)

export default FloatingButton
