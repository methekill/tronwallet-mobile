import React from 'react'
import { View, TouchableOpacity } from 'react-native'
import PropTypes from 'prop-types'
import styled, { css } from 'styled-components'
import LinearGradient from 'react-native-linear-gradient'
import FontelloIcon from '../FontelloIcon'

import { Colors, Spacing } from '../DesignSystem'
import { Text } from '../Utils'

export const HEADER_HEIGHT = 64

export const HeaderWrapper = styled.View`
  background-color:${Colors.background};
`
export const Header = styled.View`
  height: ${HEADER_HEIGHT}px;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  padding: ${Spacing.medium}px;
  ${props => props.position && css`position: ${props.position}`};
  ${props => props.paddingTop && css` padding-top: ${props.paddingTop}px`};
  ${props => props.border && css`border-bottom-width: 1px`};
  ${props => props.border && css`border-bottom-color: black`};
`
export const SearchBarWrapper = styled.View`
    flex:1;
    align-items: center;
    flex-direction: row;
`
export const SearchBar = styled.TextInput`
  font-family: Rubik-Medium;
  font-size: 16px;
  line-height: 18px;
  color: ${Colors.primaryText};
  flex: 1;
  width: 100%;
  padding: 8px;
`
export const SearchPreview = props => (
  <LinearGradient
    start={{ x: 0, y: 0.4 }}
    end={{ x: 0, y: 1 }}
    colors={[Colors.primaryGradient[0], Colors.primaryGradient[1]]}
    style={{ width: '100%', alignItems: 'center', justifyContent: 'flex-start', marginBottom: 8 }}
  >
    <View style={{width: '100%', paddingLeft: 16, paddingVertical: 10, justifyContent: 'center', marginLeft: 8, backgroundColor: Colors.background}}>
      <Text letterSpacing={0.8} size='xsmall' color={Colors.greyBlue}>{props.preview}</Text>
    </View>
  </LinearGradient>
)

SearchPreview.propTypes = {
  preview: PropTypes.string.isRequired
}

SearchPreview.defaultProps = {
  preview: 'Put some preview title of the list here'
}

export const ButtonHeader = styled.TouchableOpacity`
  width: 50px;
  height: ${HEADER_HEIGHT}px;
  padding: 0px 10px;
  justify-content: center;
  align-content: center;
  align-items: center;
`

const BadgeWrapper = styled.View`
  width: 30px;
`

const BadgeIcon = styled.View`
  width: 10px;
  height: 10px;
  border-radius: 5px;
  background-color: ${props => props.bgColor};
  position: absolute;
  top: 2px;
  right: 10px;
`

export const Badge = ({ children, value, bgColor }) => {
  return (
    <BadgeWrapper>
      {children}
      {value && (<BadgeIcon bgColor={bgColor} />)}
    </BadgeWrapper>
  )
}

Badge.defaultProps = {
  bgColor: 'green'
}

export const FloatingTouchable = styled(TouchableOpacity)`
  padding: 8px;
  position absolute;
  left: -160;
  top: 5;
  background-color: transparent;
  z-index: ${props => props.zIndex || 1}
`

export const FloatingIconButton = ({ iconName, iconSize, iconColor, onPress, zIndex }) => (
  <FloatingTouchable onPress={onPress} zIndex={zIndex}>
    <FontelloIcon
      name={iconName}
      size={iconSize}
      color={iconColor}
    />
  </FloatingTouchable>
)

FloatingIconButton.defaultProps = {
  iconSize: 36,
  iconColor: 'white',
  onPress: () => {}
}
