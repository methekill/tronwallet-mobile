import React from 'react'
import styled from 'styled-components'
import { Colors, Spacing } from '../../components/DesignSystem'
import * as Utils from '../../components/Utils'

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
export const ExchangePair = ({firstToken, secondToken, price}) =>
  <Utils.View paddingX='medium' marginY={18} flex={1} justify='center' align='center'>
    <Utils.View height={0.6} background={Colors.greyBlue} width='100%' />
    <Utils.Text marginY={8} size='smaller' color={Colors.greyBlue}>
      {`${firstToken}/${secondToken} ≈ ${price.toFixed(4)}`}
    </Utils.Text>
    <Utils.View height={0.6} background={Colors.greyBlue} width='100%' />
  </Utils.View>

export const ExchangeVariation = ({text}) =>
  <Utils.Text padding={15} font='regular' size='tiny' align='center'>
    {text}
  </Utils.Text>
