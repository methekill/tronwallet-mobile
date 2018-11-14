import styled from 'styled-components'
import { Colors, Spacing } from '../../components/DesignSystem'

export const ExchangeRow = styled.TouchableOpacity`
  flex-direction: row;
  padding-horizontal: ${Spacing.medium};
  padding-vertical: ${Spacing.medium};
`
export const Divider = styled.View`
  width: 95%;
  background-color: ${Colors.greyBlue};
  height: 0.6;
`
