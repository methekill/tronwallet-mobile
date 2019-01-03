import React from 'react'
import { Image } from 'react-native'
import { ListItem, Avatar } from 'react-native-elements'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { Colors } from './../DesignSystem'

const AvatarWrapper = styled.View`
  align-self: flex-start;
  margin-right: 5px;
`

const NewListItem = ({ title, subtitle, rightTitle, avatar, onPress }) => (
  <ListItem
    onPress={onPress || null}
    title={title}
    subtitle={subtitle}
    hideChevron
    titleNumberOfLines={2}
    // subtitleNumberOfLines={3}
    rightTitle={rightTitle}
    avatar={
      avatar && (
        <AvatarWrapper>
          <Avatar
            rounded
            source={avatar}
            medium
          />
        </AvatarWrapper>
      )
    }
    containerStyle={{
      paddingTop: 29,
      borderBottomColor: Colors.dusk,
      minHeight: 142,
      borderBottomWidth: 0.8,
      marginRight: 21
    }}
    titleStyle={{
      color: Colors.primaryText,
      fontFamily: 'Rubik-Medium',
      fontSize: 13,
      marginBottom: 6,
      maxWidth: '77%'
    }}
    rightTitleStyle={{
      fontFamily: 'Rubik-Regular',
      fontSize: 10,
      color: Colors.greyBlue
    }}
    rightTitleContainerStyle={{
      position: 'absolute',
      top: 0,
      right: -15
    }}
    subtitleStyle={{
      fontFamily: 'Rubik-Regular',
      fontSize: 12,
      color: Colors.greyBlue,
      lineHeight: 20,
      height: '100%'
    }}
    underlayColor='rgba(0, 0, 0, 0.54)'
  />
)

NewListItem.propTypes = {
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
  subtitle: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
  rightTitle: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
  avatar: Image.propTypes.source
}

export default NewListItem
