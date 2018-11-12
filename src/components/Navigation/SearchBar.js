import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'

import * as Utils from '../Utils'
import { Colors } from '../DesignSystem'
import { SearchBarWrapper, SearchBar } from './elements'
import FontelloIcon from '../FontelloIcon'
import FontelloButton from '../FontelloButton'

class NavigationSearchBar extends PureComponent {
  static defaultProps = {
    disabled: false,
    title: 'Right Button',
    delay: 800
  }

  static propTypes = {
    onSearch: PropTypes.func.isRequired,
    onClose: PropTypes.func
  }

  typingTimeout = null

  _onFieldChange = (text) => {
    if (this.intervalId) {
      clearTimeout(this.intervalId)
    }
    this.intervalId = setTimeout(() => {
      this.props.onSearch(text)
    }, this.props.delay)
  }

  render () {
    const { onClose } = this.props
    return (
      <SearchBarWrapper>
        <Utils.View paddingBottom={3}>
          <FontelloIcon
            name='magnifier,-search,-discover,-zoom,-lens'
            color={Colors.greyBlue}
            size={16}
          />
        </Utils.View>
        <Utils.HorizontalSpacer />
        <SearchBar
          autoCapitalize='none'
          autoCorrect={false}
          underlineColorAndroid='transparent'
          onChangeText={text => this._onFieldChange(text)}
          selectionColor={Colors.greyBlue}
          height={42}
          autoFocus
          returnKeyType='search'
        />
        <FontelloButton
          padding={10}
          onPress={onClose}
          size={13}
          name='close'
          color={Colors.primaryText}
        />
      </SearchBarWrapper>
    )
  }
}

export default NavigationSearchBar
