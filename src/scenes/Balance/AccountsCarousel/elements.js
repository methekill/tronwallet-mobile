import React from 'react'
import styled, { css } from 'styled-components'
import { View } from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import { Motion, spring } from 'react-motion'

import ClearButton from '../../../components/ClearButton'
import { Colors } from './../../../components/DesignSystem'
import * as Utils from './../../../components/Utils'

const borderRadius = css`
  border-radius: 6px;
`
export const CarouselCard = styled.View.attrs({
  elevation: 5
})`
  ${borderRadius} min-height: 180px;
  background-color: #66688f60;
  position: relative;
  margin-bottom: 10px;
  box-shadow: 0px 1px 1px rgba(0, 0, 0, 0.54);
`
export const TronLogo = styled.View`
  position: absolute;
  right: 15px;
  top: 20px;
  elevation: 5;
  width: 36px;
  height: 36px;
  border-radius: 18;
  box-shadow: 0px 1px 2px black;
`
export const Icon = styled.Image`
  height: 36px;
  width: 36px;
`
export const CardInfoText = styled.Text`
  font-family: 'Rubik-Medium';
  font-size: 11px;
  color: ${props => props.color};
`

CardInfoText.defaultProps = {
  color: Colors.primaryText
}

export const CardTopDecoration = styled(LinearGradient)`
  height: 3px;
  ${borderRadius};
`
export const CardBg = styled(LinearGradient)`
  flex: 1;
  padding: 22px;
  align-items: flex-start;
  ${borderRadius};
`

export const Stuff = styled.View`
  z-index: 1;
`

export const CardFooter = styled.View`
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  border-color: ${Colors.background};
  border-top-width: 1px;
  width: 100%;
  height: 41px;
  padding-left: 11px;
`

export const Value = styled.Text`
  font-family: 'Rubik-Medium';
  font-size: 16px;
  color: ${Colors.primaryText};
  ${props =>
    props.paddingRight &&
    css`
      padding-right: ${props.paddingRight}px;
    `};
`

export const Label = Value.extend`
  font-size: 12px;
  color: ${Colors.greyBlue};
  ${props =>
    props.paddingLeft &&
    css`
      padding-left: ${props.paddingLeft}px;
    `};
`

export const CardInfo = ({ label, value, currency, precision = 0 }) => (
  <View>
    <Label>{label}</Label>
    <Utils.VerticalSpacer size='xsmall' />
    <Motion defaultStyle={{ power: 0 }} style={{ power: spring(value) }}>
      {({ power }) => (
        <Value>{`${power.toFixed(precision)} ${currency}`}</Value>
      )}
    </Motion>
  </View>
)

export const BtnTrashWrapper = styled.View`
  width: 40px;
  height: 41px;
  border-left-width: 1px;
  border-color: ${Colors.background};
  align-content: center;
  align-items: center;
  justify-content: center;
`
export const BtnTrash = ({ onPress }) => (
  <BtnTrashWrapper>
    <ClearButton
      style={{ alignItems: 'center' }}
      onPress={onPress}
      padding={0}
      size={20}
    />
  </BtnTrashWrapper>
)

// borderTopLeftRadius: 6px;
// borderTopRightRadius: 6px;
