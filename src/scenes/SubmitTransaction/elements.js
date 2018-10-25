import React from 'react'
import { ActivityIndicator } from 'react-native'
import styled from 'styled-components'

import tl from '../../utils/i18n'
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
    <Utils.Text secondary size='smaller'>{tl.t('submitTransaction.data')}</Utils.Text>
    <Utils.VerticalSpacer size='small' />
    <Utils.Text align='right' style={{maxWidth: '70%'}} size='xsmall'>{data}</Utils.Text>
  </RowView>
)

const resultColor = {'SUCCESS': Colors.weirdGreen, 'FAIL': Colors.redError}

export const ExchangeRow = ({title, loading, result}) => (
  <RowView>
    <Utils.Text secondary size='smaller'>{title}</Utils.Text>
    <Utils.VerticalSpacer size='small' />
    {loading
      ? <ActivityIndicator size='small' color='white' />
      : <Utils.Text
        align='right'
        color={resultColor[result] || Colors.primaryText}
        size='xsmall'>
        {result || 'Waiting...'}
      </Utils.Text>}
  </RowView>
)
