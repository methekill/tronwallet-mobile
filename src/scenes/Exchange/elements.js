import React from 'react'
import { Image, ScrollView, TouchableOpacity } from 'react-native'
import styled, { css } from 'styled-components'
import PropTypes from 'prop-types'

import { Colors, Spacing } from '../../components/DesignSystem'
import * as Utils from '../../components/Utils'

const DEFAULT_LOGO = require('../../assets/tron-logo-small.png')

export const PERCENTAGE_OPTIONS = [
  {label: '25%', value: 0.25},
  {label: '50%', value: 0.5},
  {label: '75%', value: 0.75},
  {label: '100%', value: 1.00}
]

export const ExchangeRow = styled.TouchableOpacity`
  flex-direction: row;
  padding-horizontal: ${Spacing.medium};
  padding-vertical: ${Spacing.medium};
`
export const Divider = styled.View`
  width: ${props => props.full ? '100%' : '95%'};
  padding-right: ${Spacing.medium};
  background-color: ${Colors.greyBlue};
  height: 0.5;
`
export const ExchangePair = ({firstToken, secondToken, price}) => (
  <Utils.View marginY={Spacing.small} flex={1} justify='center' align='center'>
    <Utils.View height={0.6} background={Colors.greyBlue} width='100%' />
    <Utils.Text marginY={8} size='smaller' color={Colors.greyBlue}>
      {`${firstToken}/${secondToken} ≈ ${price.toFixed(4)}`}
    </Utils.Text>
    <Utils.View height={0.6} background={Colors.greyBlue} width='100%' />
  </Utils.View>
)

ExchangePair.propTypes = {
  firstToken: PropTypes.string.isRequired,
  secondToken: PropTypes.string.isRequired,
  price: PropTypes.number.isRequired
}

export const ExchangeVariation = ({text}) => (
  <Utils.Text marginY={10} marginX={15} font='regular' size='tiny' align='center'>
    {text}
  </Utils.Text>
)

ExchangeVariation.propTypes = {
  text: PropTypes.string.isRequired
}

export const TinyTriangle = ({color, direction}) => (
  <Utils.View style={{
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 4,
    borderRightWidth: 4,
    borderBottomWidth: 9,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: color,
    transform: [
      {rotate: direction === 'up' ? '0deg' : '180deg'}
    ]}}
  />
)
TinyTriangle.propTypes = {
  color: PropTypes.string.isRequired,
  direction: PropTypes.oneOf(['up', 'down']).isRequired
}

export const ExchangeLogo = ({source}) => (
  <Image
    source={source ? {uri: source} : DEFAULT_LOGO}
    style={{
      width: 50,
      height: 50,
      borderRadius: 25,
      borderWidth: 1,
      borderColor: Colors.greyBlue,
      alignSelf: 'center'
    }}
  />
)
ExchangeLogo.propTypes = {
  source: PropTypes.string
}

export const EmptyList = ({text}) => (
  <Utils.View flex={1} align='center' justify='center' padding={20}>
    <Image
      source={require('../../assets/empty.png')}
      resizeMode='contain'
      style={{ width: 200, height: 200 }} />
    <Utils.Text size='tiny'>{text}</Utils.Text>
  </Utils.View>
)

EmptyList.propTypes = {
  text: PropTypes.string
}

export const ScrollWrapper = (props) => (
  <ScrollView
    contentContainerStyle={{paddingVertical: Spacing.medium}}>
    {props.children}
  </ScrollView>
)

/**
 * Transactions Elements
 */
export const CopyableText = ({text, onPress}) => (
  <TouchableOpacity onPress={() => onPress(text)}>
    <Utils.Text size='xsmall' marginY={5} color={Colors.greyBlue}>{text}</Utils.Text>
  </TouchableOpacity>
)
export const TransactionRow = styled.View`
  ${props => props.flex && css` flex: ${props.flex}`};
  justify-content: space-between;
  flex-direction: row;
  align-items: center;
`

export const ExpandRow = TransactionRow.extend`
  justify-content: center;
`

export const TransactionHeader = TransactionRow.extend`
  padding-horizontal: ${Spacing.medium};
`
