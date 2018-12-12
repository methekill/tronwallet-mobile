import React from 'react'
import styled, { css } from 'styled-components'
import PropTypes from 'prop-types'
import capitalize from 'lodash/capitalize'
import * as Utils from './../../components/Utils'
import { Colors } from '../../components/DesignSystem'

const BaseText = css`
  color: ${Colors.secondaryText};
  margin-top: 25px;
  margin-bottom: 10px;
  padding-horizontal: 16px;
  background-color: ${Colors.background};
`
export const SectionTitle = styled.Text`
  ${BaseText}
`

export const MultiSelectColors = {
  text: Colors.primaryText,
  searchPlaceholderTextColor: Colors.primaryText,
  searchSelectionColor: Colors.primaryText,
  chipColor: Colors.primaryText,
  success: Colors.secondaryGradient[0],
  cancel: Colors.secondaryGradient[0],
  primary: Colors.secondaryGradient[0]
}

export const MultiSelectStyles = {
  container: {
    backgroundColor: Colors.lightBackground
  },
  separator: {
    backgroundColor: Colors.lightestBackground
  },
  searchBar: {
    backgroundColor: Colors.lightBackground
  },
  searchTextInput: {
    color: Colors.primaryText
  }
}

const ListItemWrapper = styled.TouchableWithoutFeedback``
const arrowIconName = 'arrow,-right,-right-arrow,-navigation-right,-arrows'

export const ListItem = ({ title, onPress, right, icon }) => (
  <ListItemWrapper onPress={onPress}>
    <Utils.Item padding={16}>
      <Utils.Row justify='space-between' align='center'>
        <Utils.Row justify='space-between' align='center'>
          <Utils.View paddingRight='medium' paddingLeft='small' >
            <Utils.TWIcon
              name={icon}
              size={22}
              color={Colors.secondaryText}
            />
          </Utils.View>
          <Utils.View>
            <Utils.Text lineHeight={20} size='small'>
              {capitalize(title)}
            </Utils.Text>
          </Utils.View>
        </Utils.Row>
        {(!!onPress && !right) && (
          <Utils.TWIcon
            name={arrowIconName}
            size={15}
            color={Colors.secondaryText}
          />
        )}
        {right && right()}
      </Utils.Row>
    </Utils.Item>
  </ListItemWrapper >
)

ListItem.propTypes = {
  title: PropTypes.string.isRequired,
  onPress: PropTypes.func,
  right: PropTypes.func,
  icon: PropTypes.string
}
