import React from 'react'
import styled from 'styled-components'

import { Colors } from '../../components/DesignSystem'
import * as Utils from '../../components/Utils'

export const RowView = styled.View`
    width: 100%;
    border-radius: 3px;
    flex-direction: row;
    justify-content: space-between;
    align-self: center;
    background-color: ${Colors.lightBackground};
    border-color: ${Colors.lightBackground};
    padding-vertical: 20px;
    padding-horizontal: 15px;
    margin-vertical: 0.5px;
`

export const DetailRow = ({ title, text, address }) => (
  <RowView>
    <Utils.Text secondary size='smaller'>
      {title}
    </Utils.Text>
    <Utils.Text size={address ? 'xsmall' : 'smaller'}>{text}</Utils.Text>
  </RowView>
)

export const DataRow = ({ data }) => (
  <RowView>
    <Utils.Text secondary size='smaller'>DATA</Utils.Text>
    <Utils.VerticalSpacer size='small' />
    <Utils.Text align='right' style={{maxWidth: '70%'}} size='xsmall'>{data}</Utils.Text>
  </RowView>
)
