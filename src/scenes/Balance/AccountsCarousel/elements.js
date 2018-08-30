import styled, { css } from 'styled-components'
import LinearGradient from 'react-native-linear-gradient'

const borderRadius = css`
  border-radius: 6px;
`
export const CarouselCard = styled.View`
  ${borderRadius}
  min-height: 180px;
  background-color: #66688F60;
  elevation: 2;
  position: relative;
  margin-bottom: 10px;
`
export const TronLogo = styled.View`
  position: absolute;
  right: 15px;
  top: 15px;
  elevation: 5;
`
export const Icon = styled.Image`
  height: 36px;
  width: 36px;
`
export const CardInfoText = styled.Text`
  font-family: Rubik-Regular;
  font-size: 13px;
  color: #787986;
`
export const CardTopDecoration = styled(LinearGradient)`
  height: 3px;
  ${borderRadius}
`
export const CardBg = styled(LinearGradient)`
  flex: 1;
  padding: 22px;
  alignItems: flex-start;
  ${borderRadius}
`
export const Stuff = styled.View`
  z-index: 1;
`
// borderTopLeftRadius: 6px;
// borderTopRightRadius: 6px;
