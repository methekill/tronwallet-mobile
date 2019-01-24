import React, { Component } from 'react'
import { RefreshControl } from 'react-native'
import * as Animatable from 'react-native-animatable'
import sortBy from 'lodash/sortBy'
import { Text } from '../../components/Utils'
import tl from './../../utils/i18n'

import { DAppButton, HomeContainer, HomeTitle, HomeSection, BtnRemove, DAppButtonWrapper, BtnCancel, ScrollView } from './elements'
import { getBookmarks, removeBookmark, saveHomeHistory, getHomeHistory, removeHomeHistory } from './../../utils/dappUtils'
import { getDApps } from './../../services/contentful/general'

const Remove = Animatable.createAnimatableComponent(BtnRemove)

class WebViewHome extends Component {
  static displayName = 'WebView Home'

  static defaultProps = {
    onPress: () => { }
  }

  state = {
    dapps: [],
    bookmarks: [],
    history: [],
    showRemoveIcon: false,
    refreshing: false
  }

  componentDidMount () {
    setTimeout(() => {
      this._load()
    }, 500)
  }

  syncData = () => this._load()

  _load = async () => {
    this.setState({ refreshing: true })
    const { data: bookmarks } = await getBookmarks()
    const { data: history } = await getHomeHistory()
    const dapps = await getDApps()

    this.setState({
      bookmarks,
      history: sortBy(history, arr => new Date(arr.update_at)).reverse(),
      dapps,
      refreshing: false
    })
  }

  _removeBookmark = (item) => {
    removeBookmark(item.url)
      .then(() => {
        this._load()
      })
  }

  _removeHomeHistory = (item) => {
    removeHomeHistory(item.url)
      .then(() => {
        this._load()
      })
  }

  _onPress = (item) => {
    const { onPress } = this.props
    onPress(item.url)
    saveHomeHistory(item)
      .then(() => {
        this._load()
      })
  }

  _onRefresh = () => {
    this._load()
  }

  _renderBookmark = () => {
    const { bookmarks } = this.state
    if (!bookmarks.length) return null

    return (
      <HomeContainer>
        <HomeTitle>
          <Text>{tl.t('dapps.home.bookmark.title')}</Text>
          {this.state.showRemoveIcon && (
            <Animatable.View animation='fadeIn' iterationCount={1} >
              <BtnCancel onPress={() => this.setState({ showRemoveIcon: false })}>
                <Text color='#000' size='xsmall'>{tl.t('dapps.home.cancelOperation')}</Text>
              </BtnCancel>
            </Animatable.View>
          )}
        </HomeTitle>
        <HomeSection>
          <ScrollView horizontal>
            {bookmarks.map((d, index) => {
              if (this.state.showRemoveIcon) {
                return (
                  <DAppButtonWrapper key={index}>
                    <Animatable.View animation='swing' easing='ease' iterationCount='infinite' delay={500} >
                      <DAppButton dapp={{ ...d, name: d.title }} onPress={() => this._onPress(d)} />
                    </Animatable.View>
                    <Remove animation='fadeIn' iterationCount={1} duration={500} onPress={() => this._removeBookmark(d)} />
                  </DAppButtonWrapper>
                )
              }

              return (
                <DAppButton
                  key={index}
                  dapp={{ ...d, name: d.title }}
                  onPress={() => this._onPress(d)}
                  onLongPress={() => this.setState({ showRemoveIcon: true })}
                />
              )
            })}
          </ScrollView>
        </HomeSection>
      </HomeContainer>
    )
  }

  _renderHistory = () => {
    const { history } = this.state
    if (!history.length) return null

    return (
      <HomeContainer>
        <HomeTitle>
          <Text>{tl.t('dapps.home.history.title')}</Text>
          {this.state.showRemoveIcon && (
            <Animatable.View animation='fadeIn' iterationCount={1} >
              <BtnCancel onPress={() => this.setState({ showRemoveIcon: false })}>
                <Text color='#000' size='xsmall'>{tl.t('dapps.home.cancelOperation')}</Text>
              </BtnCancel>
            </Animatable.View>
          )}
        </HomeTitle>
        <HomeSection>
          <ScrollView horizontal>
            {history.map((d, index) => {
              const dapp = { ...d, name: d.name || d.title }
              if (this.state.showRemoveIcon) {
                return (
                  <DAppButtonWrapper key={index}>
                    <Animatable.View animation='swing' easing='ease' iterationCount='infinite' delay={500} >
                      <DAppButton dapp={dapp} onPress={() => this._onPress(d)} />
                    </Animatable.View>
                    <Remove animation='fadeIn' iterationCount={1} duration={500} onPress={() => this._removeHomeHistory(d)} />
                  </DAppButtonWrapper>
                )
              }

              return (
                <DAppButton
                  key={index}
                  dapp={dapp}
                  onPress={() => this._onPress(d)}
                  onLongPress={() => this.setState({ showRemoveIcon: true })}
                />
              )
            })}
          </ScrollView>
        </HomeSection>
      </HomeContainer>
    )
  }

  render () {
    const { dapps } = this.state

    return (
      <ScrollView
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={this.state.refreshing}
            onRefresh={this._onRefresh}
          />
        }
      >
        {this._renderHistory()}
        {this._renderBookmark()}
        <HomeContainer>
          <HomeTitle>
            <Text>Popular</Text>
          </HomeTitle>
          <HomeSection>
            <ScrollView horizontal>
              {dapps.map((d, index) => <DAppButton key={index} dapp={d} onPress={() => this._onPress(d)} />)}
            </ScrollView>
          </HomeSection>
        </HomeContainer>
      </ScrollView>
    )
  }
}

export default WebViewHome
