import styled from 'styled-components'
import { Colors } from '../DesignSystem'

export const Wrapper = styled.View`
  padding-vertical: 6px;
  position: relative;
`

export const InputWrapper = styled.View`
  padding-horizontal: 8px;
  padding-vertical: 5.5px;
  border-radius: 4px;
  border-width: 1px;
  border-color: ${props => props.borderColor};
  flex-direction: row;
  align-items: center;
`

export const LabelWrapper = styled.View`
  padding-vertical: 2px;
  padding-horizontal: 4px;
  background-color: ${props => props.color};
  z-index: 999;
  position: absolute;
  left: 5px;
`

export const Label = styled.Text`
  font-size: 10px;
  font-family: Rubik-Medium;
  letter-spacing: 0.55;
  line-height: 11px;
  color: #66688F;
`

export const TextInput = styled.TextInput`
  font-family: Rubik-Medium;
  font-size: 16px;
  line-height: 18px;
  color: ${props => props.color || Colors.primaryText};
  flex: 1;
  padding: 8px;
  ${props => props.align && `text-align: ${props.align}`};
`
