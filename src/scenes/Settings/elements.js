import styled, { css } from 'styled-components'
import { Colors } from '../../components/DesignSystem'

const BaseText = css`
  color: ${Colors.secondaryText};
  margin-top: 25px;
  margin-bottom: 10px;
  margin-horizontal: 16px;
`
export const SectionTitle = styled.Text`
  ${BaseText}
`
