import React from 'react'
import styled from 'styled-components'
import { Colors, Spacing } from '../../components/DesignSystem'
import * as Utils from '../../components/Utils'

// Create
export const MainCard = styled.View`
  border-radius: 5px;
  backgroundColor: ${Colors.lighterBackground};
  padding: 12px;
`
export const SeedMessage = styled.View`
  align-items: center;
  justify-content: center;
  paddingHorizontal:32px;
  paddingVertical: 10px;
`
export const SeedInfo = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  paddingHorizontal: 38px;
`
export const ButtonRow = styled.View`
  flex-direction: row;
  align-items: center;
  height: 60px;
  justify-content: center;
  paddingHorizontal: 5px;
`

export const SecretText = Utils.Text.extend`
  margin-bottom: 52px;
  margin-top: 24px;
`
export const Card = Utils.View.extend`
  elevation: 5;
  box-shadow: 0px 1px 1px rgba(0, 0, 0, 0.54);
`

export const SecretCard = props =>
  <Card
    margin={20}
    padding={Spacing.medium}
    borderRadius={5}
    background={Colors.lighterBackground}>
    {props.children}
  </Card>

export const Secret = ({secret}) =>
  <SecretText
    size='smaller'
    lineHeight={24}
    padding={5}
    align='center'>
    {secret}
  </SecretText>
