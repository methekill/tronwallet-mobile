import React, { Component } from 'react'
import { Animated, Dimensions } from 'react-native'
import { FlatList } from 'react-navigation'
import styled, { css } from 'styled-components'
import Toast from 'react-native-easy-toast'
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

  open = () => {
    this._open(() => {
      this._input.focus()
    })
    this.setState({ expanded: true })
  }

  _open = (cb) => {
    Animated.spring(this.state.heightAnimation, {
      toValue: MAX_HEIGHT
    }).start(cb)
  }

  _close = (cb) => {
    Animated.spring(this.state.heightAnimation, {
      toValue: MIN_HEIGHT
    }).start(cb)
  }

  _toogle = () => {
    Animated.spring(this.state.heightAnimation, {
      toValue: this.state.expanded ? MIN_HEIGHT : MAX_HEIGHT
    }).start()
    this.setState({
      expanded: !this.state.expanded
    })
  }

  _onInputFocus = () => {
    this.setState({ expanded: true })
    this._open()
    getSearchHistory()
      .then(data => {
        this.setState({ history: data })
      })
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
          this._toogle()
          this._input.blur()
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
    if (isURL(searchValue)) {
      this._input.blur()
      this.setState({ expanded: false, searchValue: '' })
      this._close()
      if (searchValue !== '') {
        this._input.clear()
        const url = this._parseURL(searchValue)
        this.props.onSearch(url)
        saveSearchHistory({ url, title: '' })
      }
    } else {
      this.refs.toast.show(tl.t('dapps.search.error'), 800)
    }
  }

  _onChangeText = (text) => {
    if (this.intervalId) {
      clearTimeout(this.intervalId)
    }
    this.intervalId = setTimeout(() => {
      this.setState({ searchValue: text })
    }, 800)
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
              innerRef={ref => { this._input = ref }}
              onFocus={this._onInputFocus}
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
        <Toast ref='toast' position='top' />
      </View>
    )
  }
}

export default SearchDapps
