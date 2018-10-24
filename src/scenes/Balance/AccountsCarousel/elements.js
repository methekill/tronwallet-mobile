import styled, { css } from 'styled-components'
import LinearGradient from 'react-native-linear-gradient'
import { Colors } from './../../../components/DesignSystem'
import * as Utils from './../../../components/Utils'

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
  top: 20px;
  elevation: 5;
  width: 36px;
  height: 36px;
  border-radius: 18;
  box-shadow: 0px 2px 2px black;
`
export const Icon = styled.Image`
  height: 36px;
  width: 36px;  
`
export const CardInfoText = Utils.Text.extend.attrs({
  color: Colors.greyBlue,
  size: 'smaller'
})``

export const CardTopDecoration = styled(LinearGradient)`
  height: 3px;
  ${borderRadius}
`
export const CardBg = styled(LinearGradient)`
  flex: 1;
  padding: 22px;
  align-items: flex-start;
  ${borderRadius}
`
export const Stuff = styled.View`
  z-index: 1;
`

export const CardFooterIcon = styled.Image`
  width: 16px;
  height: 16px;
`

export const CardFooter = styled.View`
  flex-direction: row;
  border-color: ${Colors.background};
  border-top-width: 3px;
  width: 100%;
  height: 41px;
`

export const CardFooterItem = Utils.Row.extend.attrs({
  flex: 1,
  justify: 'space-between',
  padding: 11
})``

export const Divider = Utils.HorizontalSpacer.extend.attrs({
  size: 'tiny'
})`
  background-color: ${Colors.background};
`

// borderTopLeftRadius: 6px;
// borderTopRightRadius: 6px;
