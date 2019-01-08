import React from 'react'
import { View } from 'react-native'
import styled from 'styled-components'
import LinearGradient from 'react-native-linear-gradient'
import { ListItem } from 'react-native-elements'
import PropTypes from 'prop-types'

import { Text, Row } from '../../components/Utils'
import ButtonIconGradient from '../../components/ButtonIconGradient'
import Icon from 'react-native-vector-icons/Feather'

import { Colors } from '../../components/DesignSystem'

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
  background-color: ${Colors.lightBackground};
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
  border-radius: 5;
  margin-top: 2%;
`

export const HomeContainer = styled.View`
  flex: 1;
  background-color: ${Colors.lightBackground};
`

export const WebViewLimit = styled.View`
  flex: 0.001;
`
export const HomeTitle = styled.View`
  flex: 0.10;
  justify-content: center;
  align-items: flex-start;
  padding-horizontal: 5%;
`

export const HomeSection = styled.View`
  flex: 0.90;
  flex-direction: row;
  padding-horizontal: 5%;
  justify-content: flex-start;
  align-items: flex-start;
`

const ButtonContainer = styled.View`
  margin-left: 5%;
`

export const CardContainer = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
  height: 100%;
  background-color: rgba(${Colors.RGB.background}, 0.90);
`

export const DAppButton = ({ dapp, onPress }) => {
  return (
    <ButtonContainer>
      <ButtonIconGradient
        text={dapp.name}
        color={Colors.primaryText}
        onPress={() => onPress(dapp.url)}
        icon={<View />}
      />
    </ButtonContainer>
  )
}

export const WebViewHeaderWrapper = styled.View`
  height: 30px;
  width: 100%;
  background-color: ${Colors.slateGrey};
  padding: 0px 16px;
`
export const WebViewHeader = ({ title }) => (
  <WebViewHeaderWrapper>
    <Text color={Colors.greyBlue} size='xsmall' font='medium' numberOfLines={1}>{title}</Text>
  </WebViewHeaderWrapper>
)

const WebViewFooterWrapper = styled.View`
  height: 50px;
  width: 100%;
  background-color: ${Colors.slateGrey};
  flex-direction: row;
  justify-content: center;
  align-items: stretch;
  z-index: 9;
`

const Btn = styled.TouchableOpacity`
  padding: 5px 16px;
`

export const WebViewFooter = ({ onGobackPress, onGoForwardPress, onMenuPress, onSearchPress }) => (
  <WebViewFooterWrapper>
    <Row width='40%' align='center' justify='space-around' paddingRight='large'>
      <Btn onPress={onGobackPress}>
        <Icon name='arrow-left' size={20} color={Colors.primaryText} />
      </Btn>
      <Btn onPress={onGoForwardPress} disabled={onGoForwardPress === null}>
        <Icon name='arrow-right' size={20} color={onGoForwardPress === null ? Colors.greyBlue : Colors.primaryText} />
      </Btn>
    </Row>
    <Row width='60%' align='center' justify='space-between' paddingRight='medium' paddingLeft='medium' >
      <Btn onPress={onMenuPress}>
        <Icon name='grid' size={20} color={Colors.primaryText} />
      </Btn>
      <Btn onPress={onSearchPress}>
        <Icon name='search' size={20} color={Colors.primaryText} />
      </Btn>
      <Btn>
        <Icon name='star' size={20} color={Colors.primaryText} />
      </Btn>
    </Row>
  </WebViewFooterWrapper>
)

export const SearchBtn = styled.TouchableOpacity`
  padding: 5px 10px;
`

export const SearchListItem = ({ title, subtitle, onPress }) => (
  <ListItem
    title={title}
    subtitle={subtitle}
    fontFamily='Rubik-medium'
    rightIcon={{ name: 'call-made', style: { fontSize: 16 } }}
    titleNumberOfLines={1}
    subtitleNumberOfLines={1}
    underlayColor={Colors.lightBackground}
    containerStyle={{
      borderBottomWidth: 0.3,
      borderBottomColor: '#3e3f5b',
      minHeight: 62
    }}
    titleStyle={{
      color: Colors.greyBlue,
      fontFamily: 'Rubik-Medium',
      fontSize: 13
    }}
    subtitleStyle={{
      marginTop: 10,
      color: Colors.primaryText,
      fontFamily: 'Rubik-Medium',
      fontSize: 11
    }}
    onPress={onPress}
  />
)

SearchListItem.propTypes = {
  title: PropTypes.string,
  subtitle: PropTypes.string,
  onPress: PropTypes.func
}
