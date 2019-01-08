import React, { Component } from 'react'
import { ScrollView } from 'react-native'
import * as Animatable from 'react-native-animatable'
import { Text } from '../../components/Utils'
import tl from './../../utils/i18n'

import { DAppButton, HomeContainer, HomeTitle, HomeSection, BtnRemove, DAppButtonWrapper, BtnCancel } from './elements'
import { getBookmark, removeBookmark } from './../../utils/dappUtils'
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
    showRemoveIcon: false
  }

  componentDidMount () {
    Promise.all([
      getDApps(),
      getBookmark().then(result => result.data)
    ])
      .then(([dapps, bookmark]) => {
        this.setState({
          dapps,
          bookmark
        })
      })
  }

  _removeHistory = (item) => {
    removeBookmark(item.url)
      .then(bookmark => {
        this.setState({
          bookmark
        })
      })
  }

  _renderHistory = () => {
    const { onPress } = this.props
    const { bookmark } = this.state
    if (!bookmark.length) return null

    return (
      <HomeContainer>
        <HomeTitle>
          <Text>{tl.t('dapps.home.bookmark.title')}</Text>
          {this.state.showRemoveIcon && (
            <Animatable.View animation='fadeIn' iterationCount={1} >
              <BtnCancel onPress={() => this.setState({ showRemoveIcon: false })}>
                <Text color='#000' size='xsmall'>{tl.t('dapps.home.bookmark.cancelOperation')}</Text>
              </BtnCancel>
            </Animatable.View>
          )}
        </HomeTitle>
        <HomeSection>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} >
            {bookmark.map((d, index) => {
              if (this.state.showRemoveIcon) {
                return (
                  <DAppButtonWrapper key={index}>
                    <Animatable.View animation='swing' easing='ease' iterationCount='infinite' delay={500} >
                      <DAppButton dapp={{ ...d, name: d.title }} onPress={onPress} />
                    </Animatable.View>
                    <Remove animation='fadeIn' iterationCount={1} duration={500} onPress={() => this._removeHistory(d)} />
                  </DAppButtonWrapper>
                )
              }

              return (
                <DAppButton key={index} dapp={{ ...d, name: d.title }} onPress={onPress} onLongPress={() => this.setState({ showRemoveIcon: true })} />
              )
            })}
          </ScrollView>
        </HomeSection>
      </HomeContainer>
    )
  }

  render () {
    const { onPress } = this.props
    const { dapps } = this.state

    return (
      <ScrollView scrollEventThrottle={16}>
        {this._renderHistory()}
        <HomeContainer>
          <HomeTitle>
            <Text>Popular</Text>
          </HomeTitle>
          <HomeSection>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {dapps.map((d, index) => <DAppButton key={index} dapp={d} onPress={onPress} />)}
            </ScrollView>
          </HomeSection>

        </HomeContainer>
      </ScrollView>
    )
  }
}

export default WebViewHome
