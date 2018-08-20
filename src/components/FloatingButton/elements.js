import styled from 'styled-components'
import { Colors } from '../DesignSystem'

export const ButtonWrapper = styled.View`
  position: absolute;
  bottom: 20px;
  background-color: ${Colors.greyBlue};
  border-radius: 4px;
  align-self: center;
`
export const Button = styled.TouchableOpacity`
  padding: 20px;
`
export const ButtonText = styled.Text`
  font-family: Rubik-Bold;
  font-size: 12px;
  line-height: 12px;
  letter-spacing: 0.8px;
  color: white;
  text-align: center;
`
