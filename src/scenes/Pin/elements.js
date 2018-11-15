import React from 'react'
import styled from 'styled-components'
import Ionicons from 'react-native-vector-icons/Ionicons'
import { transparentize } from 'polished'

import { Colors, Spacing } from '../../components/DesignSystem'

export const Label = styled.Text`
  font-family: Rubik-Medium;
  font-size: 11px;
  color: #66688F;
  letter-spacing: 0.6;
  line-height: 12px;
`

export const Text = styled.Text`
  font-family: Rubik-Medium;
  font-size: 16px;
  color: #FFF;
  line-height: 18px;
`

export const KeyPad = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  height: 242px;
  margin: 10px;
`

export const KeyWrapper = styled.TouchableOpacity`
  height: 52px;
  align-items: center;
  justify-content: center;
  flex-basis: 30%;
  flex-grow: 1;
  flex-shrink: 0;
  border-radius: 25px;
  border-width:${props => props.noBorder ? 0 : 1}px;
  border-color:${Colors.secondaryText};
  margin: 4px;
`

export const KeyText = styled.Text`
  font-family: Rubik-Regular;
  font-size: 16px;
  line-height: 24px;
  color:${Colors.secondaryText};
`

export const Key = ({ children, noBorder, onPress }) => (
  <KeyWrapper noBorder={noBorder} onPress={() => onPress(children)} >
    <KeyText>
      {children}
    </KeyText>
  </KeyWrapper>
)

export const Wrapper = styled.View`
  width: 36px;
  height: 36px;
  border-radius: 18px;
  align-items: center;
  justify-content: center;
  background-color: ${props => props.color};
`

Wrapper.defaultProps = {
  color: 'transparent'
}

export const Circle = styled.View`
  background-color: ${props => transparentize((1 - props.opacityAmount), props.color)};
  width: ${props => props.size}px;
  height: ${props => props.size}px;
  border-radius: ${props => props.size / 2}px;
  align-items: center;
  justify-content: center;
  z-index: 1;
`

Circle.defaultProps = {
  size: 12,
  opacityAmount: 1,
  color: '#2E2F47'
}

export const PinDigit = ({ digit, currentState }) => {
  if (digit < currentState.length) {
    return (
      <Wrapper>
        <Circle color='#9b9cb7' />
      </Wrapper>
    )
  }
  if (digit > currentState.length) {
    return (
      <Wrapper>
        <Circle />
      </Wrapper>
    )
  }
  return (
    <Wrapper>
      <Circle />
    </Wrapper>
  )
}

const GoBackBtn = styled.TouchableOpacity`
  position: absolute;
  top: 10;
  left: 8;
  padding: ${Spacing.medium}px;
  z-index: 1;
`

export const GoBackButton = props => (
  <GoBackBtn {...props} >
    <Ionicons name='ios-arrow-round-back' size={32} color='#FFF' />
  </GoBackBtn>
)

export const BiometricButton = styled.TouchableOpacity`
  padding: ${Spacing.medium}px;
`
