import React from 'react'
import { TouchableOpacity } from 'react-native'
import PropTypes from 'prop-types'
import { Colors } from '../DesignSystem'
import Ionicons from 'react-native-vector-icons/Ionicons'
import Feather from 'react-native-vector-icons/Feather'

import * as Utils from '../Utils'
import FontelloIcon from '../FontelloIcon'
import { Header, SearchBar, SearchBarWrapper, HeaderWrapper, SearchPreview } from './elements'

class NavigationHeader extends React.Component {
  /*
     onClose = Right Button with X
     onBack = Left Button with <
     onSearch = Right Button with magnifying glass
   */
  static propTypes = {
    title: PropTypes.string.isRequired,
    onClose: PropTypes.func,
    onBack: PropTypes.func,
    onSearch: PropTypes.func,
    onSearchPressed: PropTypes.func,
    noBorder: PropTypes.bool,
    rightButton: PropTypes.element,
    leftButton: PropTypes.element
  }

  state = {
    isSearching: false
  }

  _renderLeftElement = (onBack, leftButton) => {
    let element = null

    if (onBack && !leftButton) {
      element = <TouchableOpacity onPress={onBack} testID='HeaderBack'>
        <Ionicons
          name='ios-arrow-round-back'
          size={38}
          color={Colors.primaryText}
        />
      </TouchableOpacity>
    } else {
      element = leftButton
    }
    return <Utils.View margin={10} position='absolute' left={10}>
      {element}
    </Utils.View>
  }

  _renderRightElement = (onClose, onSearch, onSearchPressed, rightButton) => {
    let element = null
    if (onClose && !rightButton) {
      element = <TouchableOpacity onPress={onClose} testID='HeaderClose'>
        <Feather name='x' color='white' size={28} />
      </TouchableOpacity>
    } else if (onSearch && !rightButton) {
      element =
        <TouchableOpacity onPress={() => {
          this.setState({ isSearching: true })
          if (onSearchPressed) onSearchPressed()
        }}>
          <Ionicons name='ios-search' color='white' size={21} />
        </TouchableOpacity>
    } else {
      element = rightButton
    }
    return <Utils.View margin={10} position='absolute' right={10}>
      {element}
    </Utils.View>
  }

  _renderDefaultMode = () => {
    const { title, onClose, rightButton, onBack, leftButton, onSearch, onSearchPressed } = this.props

    return (
      <React.Fragment>
        {this._renderLeftElement(onBack, leftButton)}
        <Utils.View justify='center' align='center'>
          <Utils.Text lineHeight={36} size='average' font='medium'>{title.toUpperCase()}</Utils.Text>
        </Utils.View >
        {this._renderRightElement(onClose, onSearch, onSearchPressed, rightButton)}
      </React.Fragment>
    )
  }

  _renderSeachMode = () => {
    const { onSearch, onSearchPressed } = this.props

    const onClose = () => {
      this.setState({ isSearching: false })
      if (onSearchPressed) onSearchPressed()
    }

    return (
      <React.Fragment>
        <SearchBarWrapper>
          <FontelloIcon
            name='magnifier,-search,-discover,-zoom,-lens'
            size={16}
            color={Colors.greyBlue}
          />
          <Utils.HorizontalSpacer />
          <SearchBar
            autoCapitalize='none'
            autoCorrect={false}
            underlineColorAndroid='transparent'
            onChangeText={text => onSearch(text)}
            placeholder='Search'
            placeholderTextColor='#fff'
            height={42}
            autoFocus
          />
          <TouchableOpacity onPress={onClose}>
            <Feather name='x' color='white' size={22} />
          </TouchableOpacity>
        </SearchBarWrapper>
      </React.Fragment>
    )
  }

  render () {
    const { isSearching } = this.state
    return (
      <HeaderWrapper>
        <Header border={isSearching}>
          {isSearching ? this._renderSeachMode() : this._renderDefaultMode()}
        </Header>
        {
          isSearching
            ? <SearchPreview><Utils.Text>Featured Token</Utils.Text></SearchPreview>
            : null
        }
      </HeaderWrapper>
    )
  }
}

export default NavigationHeader
