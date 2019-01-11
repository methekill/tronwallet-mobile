import React, { Component } from 'react'
import { Animated, Dimensions, Keyboard, Platform, StatusBar } from 'react-native'
import { FlatList } from 'react-navigation'
import styled, { css } from 'styled-components'
import Icon from 'react-native-vector-icons/Feather'

import * as Utils from './../../components/Utils'
import Input from './../../components/Input'
import { SearchBtn, SearchListItem as ListItem } from './elements'

import { Colors } from './../../components/DesignSystem'
import tl from './../../utils/i18n'
import { getSearchHistory, saveSearchHistory } from './../../utils/dappUtils'
import { isURL } from './../../utils/formatUrl'

const View = Animated.createAnimatedComponent(
  styled.View`
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: ${Colors.lightBackground};
  `
)

const InputWrapper = styled.View`
  padding: 10px 14px 0px;
  height: 80px;
  ${props => props.showBorder && css`
    border-bottom-width: 1.8px;
    border-bottom-color: ${Colors.darkerBackground};
  `}
`

const MAX_HEIGHT = Dimensions.get('window').height
const MIN_HEIGHT = 90

class SearchDapps extends Component {
  static displayName = 'Dapps search component'

  static defaultProps = {
    onSearch: () => null
  }

  state = {
    expanded: false,
    heightAnimation: new Animated.Value(MIN_HEIGHT),
    searchValue: '',
    history: []
  }

  typingTimeout = null

  _input = React.createRef()

  componentDidMount () {
    this.keyboardShow = Keyboard.addListener(
      Platform.select({ android: 'keyboardDidShow', ios: 'keyboardWillShow' }),
      this._onKeyboardShow
    )
    this.keyboardHide = Keyboard.addListener(
      Platform.select({ android: 'keyboardDidHide', ios: 'keyboardWillHide' }),
      this._onKeyboardHide
    )
  }

  componentWillUnmount () {
    this.keyboardShow.remove()
    this.keyboardHide.remove()
  }

  open = () => {
    this._input.current.focus()
  }

  _onKeyboardShow = (event) => {
    this.setState({ expanded: true })
    this._open(event.endCoordinates.height)
    getSearchHistory()
      .then(result => {
        this.setState({
          history: result.data
        })
      })
  }

  _onKeyboardHide = () => {
    this.setState({ expanded: false })
    this._close()
  }

  _open = (androidKeyBoardHeight, cb) => {
    Animated.spring(this.state.heightAnimation, {
      toValue: Platform.select({
        android: MAX_HEIGHT - androidKeyBoardHeight - StatusBar.currentHeight,
        ios: MAX_HEIGHT
      })
    }).start(cb)
  }

  _close = (cb) => {
    Animated.spring(this.state.heightAnimation, {
      toValue: MIN_HEIGHT
    }).start(cb)
  }

  _inputRightContent = () => {
    const { expanded, searchValue } = this.state

    if (!expanded) {
      return (
        <SearchBtn
          onPress={() => {
            this.open()
          }}
        >
          <Icon name='search' color={Colors.greyBlue} size={14} />
        </SearchBtn>
      )
    }

    if (expanded && searchValue !== '') {
      return (
        <SearchBtn onPress={() => this._onSearch(searchValue)}>
          <Utils.Text>{tl.t('dapps.search.go')}</Utils.Text>
        </SearchBtn>
      )
    }

    return (
      <SearchBtn
        onPress={() => {
          Keyboard.dismiss()
        }}
      >
        <Utils.Text>{tl.t('cancel')}</Utils.Text>
      </SearchBtn>
    )
  }

  _parseURL = (url) => {
    if (!/http(s)?/i.test(url)) {
      return `http://${url}`
    }
    return url
  }

  _onSearch = (searchValue) => {
    this._input.current.clear()
    if (isURL(searchValue)) {
      this.setState({ expanded: false, searchValue: '' })
      if (searchValue !== '') {
        const url = this._parseURL(searchValue)
        this.props.onSearch(url)
        saveSearchHistory({ url, title: '' })
      }
    }
  }

  _onChangeText = (text) => {
    if (this.intervalId) {
      clearTimeout(this.intervalId)
    }
    this.intervalId = setTimeout(() => {
      this.setState({ searchValue: text })
    }, 500)
  }

  _getHistory = () => {
    const { searchValue, history } = this.state
    if (searchValue !== '') {
      const regex = new RegExp(searchValue, 'ig')
      return history.filter(item => regex.test(item.title) || regex.test(item.url))
    }

    return history
  }

  render () {
    const { expanded } = this.state
    const style = {
      height: this.state.heightAnimation
    }
    return (
      <View style={style}>
        <Utils.SafeAreaView>
          <InputWrapper showBorder={expanded}>
            <Input
              innerRef={this._input}
              rightContent={this._inputRightContent}
              onChangeText={this._onChangeText}
              onSubmitEditing={() => this._onSearch(this.state.searchValue)}
              placeholder={tl.t('dapps.search.placeholder')}
              keyboardType='url'
              returnKeyType='go'
              borderColor={expanded ? 'transparent' : '#51526B'}
              onPaste={() => console.warn('asdasdad')}
            />
          </InputWrapper>
          {expanded && (
            <FlatList
              data={this._getHistory()}
              renderItem={({ item }) => {
                return (
                  <ListItem
                    title={item.title}
                    subtitle={item.url}
                    onPress={() => this._onSearch(item.url)}
                  />
                )
              }}
              keyExtractor={(item, index) => item.url + index}
              keyboardShouldPersistTaps='always'
              keyboardDismissMode='on-drag'
            />
          )}
        </Utils.SafeAreaView>
      </View>
    )
  }
}

export default SearchDapps
