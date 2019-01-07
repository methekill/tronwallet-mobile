import React, { Component } from 'react'
import { Text } from '../../components/Utils'

import { DAppButton, HomeContainer, HomeTitle, HomeSection } from './elements'

class WebViewHome extends Component {
  static displayName = 'WebView Home'
  static defaultProps = {
    onPress: () => { },
    dapps: []
  }

  render () {
    const { onPress, dapps } = this.props
    const dappList = dapps.map((d, index) => <DAppButton key={index} dapp={d} onPress={onPress} />)

    return (
      <HomeContainer>
        <HomeTitle>
          <Text>Popular</Text>
        </HomeTitle>

        <HomeSection>
          {dappList}
        </HomeSection>
      </HomeContainer>
    )
  }
}

export default WebViewHome
