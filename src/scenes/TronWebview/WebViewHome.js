import React, { Component } from 'react'
import { ScrollView } from 'react-native'
import * as Animatable from 'react-native-animatable'
import sortBy from 'lodash/sortBy'
import { Text } from '../../components/Utils'
import tl from './../../utils/i18n'

import { DAppButton, HomeContainer, HomeTitle, HomeSection, BtnRemove, DAppButtonWrapper, BtnCancel } from './elements'
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
    bookmark: [],
    history: [],
    showRemoveIcon: false
  }

  componentDidMount () {
    this._load()
  }

  syncData = () => this._load()

  _load = () => {
    Promise.all([
      getDApps(),
      getBookmarks().then(result => result.data),
      getHomeHistory()
        .then(result => sortBy(result.data, arr => new Date(arr.update_at)).reverse())
    ])
      .then(([dapps, bookmark, history]) => {
        this.setState({
          dapps,
          bookmark,
          history
        })
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

  _renderBookmark = () => {
    const { bookmark } = this.state
    if (!bookmark.length) return null

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
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingLeft: 16 }} >
            {bookmark.map((d, index) => {
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
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingLeft: 16 }} >
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
      <ScrollView scrollEventThrottle={16}>
        {this._renderHistory()}
        {this._renderBookmark()}
        <HomeContainer>
          <HomeTitle>
            <Text>Popular</Text>
          </HomeTitle>
          <HomeSection>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingLeft: 16 }} >
              {dapps.map((d, index) => <DAppButton key={index} dapp={d} onPress={() => this._onPress(d)} />)}
            </ScrollView>
          </HomeSection>
        </HomeContainer>
      </ScrollView>
    )
  }
}

export default WebViewHome
