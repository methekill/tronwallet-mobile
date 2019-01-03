import React from 'react'
import styled from 'styled-components'
import LinearGradient from 'react-native-linear-gradient'
import { Text } from '../../components/Utils'
import { Colors } from '../../components/DesignSystem'

import ButtonIconGradient from '../../components/ButtonIconGradient'

export const HeaderContainer = styled(LinearGradient).attrs({
  colors: [Colors.primaryGradient[0], Colors.primaryGradient[1]],
  start: { x: 0, y: 0 },
  end: { x: 1, y: 0 }
})`
  z-index: 2;
  display: flex;
  flex: 0.23;
  width: 100%;
  height: 100%;
  justify-content: center;
  align-items: center;
`

export const PageWrapper = styled.View`
  display: flex;
  flex: 1;
  flex-direction: column;
  height: 100%;
  background-color: ${Colors.lightBackground}
`

export const HeaderView = styled.View`
  z-index: 3;
  width: 100%;
  height: 100%;
  justify-content: center;
  align-items: center;
`

export const URLInput = styled.TextInput`
  background-color: ${Colors.primaryText};
  width: 85%;
  height: 35%;
  color: ${Colors.titleLabel};
  borderRadius: 5;
  margin-top: 2%;
`

export const HomeContainer = styled.View`
  flex: 1;
  background-color: ${Colors.lightBackground};
`

export const WebViewLimit = styled.View`
  flex: 0.001;
`
const HomeTitle = styled.View`
  flex: 0.10;
  justify-content: center;
  align-items: flex-start;
  padding-horizontal: 5%;
`

const HomeSection = styled.View`
  flex: 0.90;
  flex-direction: row;
  padding-horizontal: 5%;
  justify-content: flex-start;
  align-items: flex-start;
`

const ButtonContainer = styled.View`
  margin-left: 5%;
`

const DAppButton = ({ dapp, onPress }) => {
  return (
    <ButtonContainer key={dapp.name}>
      <ButtonIconGradient key={dapp.name}
        text={dapp.name}
        color={Colors.primaryText}
        onPress={() => onPress(dapp.url)}
      />
    </ButtonContainer>
  )
}

export const WebViewHome = ({ dapps, onPress }) => {
  const dappList = dapps.map(d => <DAppButton dapp={d} onPress={onPress} />)

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
