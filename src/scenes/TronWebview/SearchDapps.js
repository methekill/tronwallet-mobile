import React, { Component } from 'react'
import { Animated, Dimensions } from 'react-native'
import { FlatList } from 'react-navigation'
import styled, { css } from 'styled-components'
import Icon from 'react-native-vector-icons/Feather'
import * as Utils from './../../components/Utils'
import Input from './../../components/Input'
import { SearchBtn, SearchListItem as ListItem } from './elements'

import { Colors } from './../../components/DesignSystem'
import tl from './../../utils/i18n'
import { getSearchHistory } from './../../utils/dappUtils'

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
    this._open(() => {
      getSearchHistory()
        .then(data => {
          this.setState({ history: data })
        })
    })
  }

  _inputRightContent = () => {
    const { expanded, searchValue } = this.state

    if (!expanded) {
      return (<Icon name='search' color={Colors.greyBlue} size={14} />)
    }

    if (expanded && searchValue !== '') {
      return (
        <SearchBtn onPress={this._onSearch}>
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
    if (!/https?/g.test(url)) {
      return `http://${url}`
    }
    return url
  }

  _onSearch = () => {
    const { searchValue } = this.state
    this._input.blur()
    this.setState({ expanded: false, searchValue: '' })
    this._close()
    if (searchValue !== '') {
      this.props.onSearch(
        this._parseURL(searchValue)
      )
    }
  }

  render () {
    const { searchValue, expanded, history } = this.state
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
              onChangeText={searchValue => this.setState({ searchValue })}
              onSubmitEditing={this._onSearch}
              placeholder={tl.t('dapps.search.placeholder')}
              value={searchValue}
              keyboardType='url'
              returnKeyType='go'
              borderColor={expanded ? 'transparent' : '#51526B'}
            />
          </InputWrapper>
          {expanded && (
            <FlatList
              data={history}
              renderItem={({ item }) => (
                <ListItem
                  title={item.title ? item.title : item.url}
                  subtitle={item.title ? item.url : null}
                />
              )}
              keyExtractor={(item, index) => item.url + index}
            />
          )}
        </Utils.SafeAreaView>
      </View>
    )
  }
}

export default SearchDapps
