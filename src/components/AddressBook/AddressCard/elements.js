import styled, { css } from 'styled-components'
import { Colors } from '../../DesignSystem'

export const Card = styled.TouchableOpacity`
  border-left-width: 5px;
  border-color: #3f415d;
  height: 80px;
  margin-bottom: 1px;
  padding: 16px;
`
const Text = css`
  font-family: Rubik-Regular;
  line-height: 16px;
  color: ${Colors.greyBlue};
`
export const Name = styled.Text`
  ${Text}
  font-family: Rubik-Medium;
  font-size: 14px;
  letter-spacing: 0;
  color: white;
`
export const Alias = styled.Text`
  ${Text}
  font-size: 12px;
`
export const Address = styled.Text`
  ${Text}
  font-size: 11px;
`
