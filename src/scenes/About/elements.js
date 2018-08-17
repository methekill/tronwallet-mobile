import styled, { css } from 'styled-components'
import { Colors } from '../../components/DesignSystem'

const BaseText = css`
  color: ${Colors.secondaryText};
  padding: 20px;
  align-self: center;
`
export const Description = styled.Text`
  font-family: Rubik-Light;
  font-size: 16px;
  line-height: 20px;

  color: white;
`
export const VersionText = styled.Text`
  font-family: Rubik-Regular;
  font-size: 14px;
  letter-spacing: 0.6;
  ${BaseText}
`
export const SectionTitle = styled.Text`
  margin-top: 5px;
  font-family: Rubik-Bold;
  font-size: 14px;
  ${BaseText}
`
export const PayPartner = styled.Image`
  width: 120px;
  height: 50px;
  resize-mode: contain;
`
export const Getty = styled.Image`
  width: 150px;
  height: 50px;
  resize-mode: contain;
`
const PaddingVertical = css`
  padding-vertical: 10px;
`
export const DescriptionWrapper = styled.View`
  ${PaddingVertical}
`
export const Partners = styled.View`
  ${PaddingVertical}
`
export const TutorialWrapper = styled.View`
  padding: 20px;
  background-color: ${Colors.secondaryText};
  border-radius: 4px;
`
export const TutorialText = styled.Text`
  font-family: Rubik-Bold;
  font-size: 14px;
  color: white;
  text-align: center;
`
