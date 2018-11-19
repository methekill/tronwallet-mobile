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

export const TradePair = ({text}) =>
  <Utils.View align='center' justify='center'>
    <Utils.Text size='tiny' color={Colors.greyBlue}>
      {text}
    </Utils.Text>
  </Utils.View>
