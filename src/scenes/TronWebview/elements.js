import React from 'react'
import styled from 'styled-components'
import LinearGradient from 'react-native-linear-gradient'
import { ListItem } from 'react-native-elements'
import PropTypes from 'prop-types'
import * as Animatable from 'react-native-animatable'

import { Text, Row, TWIcon } from '../../components/Utils'
import ButtonIconGradient from '../../components/ButtonIconGradient'
import Feather from 'react-native-vector-icons/Feather'
import Ionicons from 'react-native-vector-icons/Ionicons'

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
  padding-top: 10px;
  padding-bottom: 20px;
`

export const WebViewLimit = styled.View`
  flex: 0.001;
`
export const HomeTitle = styled.View`
  justify-content: space-between;
  align-items: flex-start;
  padding-horizontal: 5%;
  flex-direction: row;
`

export const HomeSection = styled.View`
  flex: 1;
  flex-direction: row;
  justify-content: flex-start;
  align-items: flex-start;
  padding-top: 20px;
`

const ButtonContainer = styled.View`
  margin: 10px;
  width: 68px;
  height: 70px;
`

export const CardContainer = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
  height: 100%;
  background-color: rgba(${Colors.RGB.background}, 0.90);
  padding: 0px 20px;
`

const getDefaultFavIcon = (url) => `https://s2.googleusercontent.com/s2/favicons?domain_url=${url}`

const BtnImage = styled.Image.attrs({
  resizeMode: 'cover'
})`
  width: 60px;
  height: 60px;
  border-width: 1px;
  border-radius: 31px;
`

const BtnIcon = styled(BtnImage)`
  width: 20px;
  height: 20px;
  border-radius: 10px;
`

export const DAppButton = ({ dapp, onPress, onLongPress }) => (
  <ButtonContainer>
    <ButtonIconGradient
      text={dapp.name}
      color={Colors.primaryText}
      onPress={() => onPress(dapp.url)}
      size={64}
      icon={
        dapp.image ? (
          <BtnImage source={{ url: dapp.image }} />
        ) : (
          <BtnIcon
            source={{
              uri: getDefaultFavIcon(dapp.url)
            }}
            resizeMode='contain'
          />
        )
      }
      onLongPress={onLongPress}
    />

  </ButtonContainer>
)

export const BtnRemove = styled(Ionicons).attrs({
  size: 30,
  color: '#fff',
  name: 'ios-close-circle'
})`
  position: absolute;
  top: 0px;
  right: 5px;
`

export const DAppButtonWrapper = styled.View`
  position: relative;
`

export const BtnCancel = styled.TouchableOpacity`
  padding: 2px 10px;
  background-color: #fff;
  border-color: #fff;
  border-width: 1px;
  border-radius: 10px;
  align-self: flex-end;
`

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

export const WebViewFooter = ({ onGobackPress, onGoForwardPress, onMenuPress, onSearchPress, onBookMarkPress, isBookmark, disabled }) => (
  <WebViewFooterWrapper>
    <Row width='40%' align='center' justify='space-around' paddingRight='large'>
      <Btn onPress={onGobackPress}>
        <Feather name='arrow-left' size={20} color={Colors.primaryText} />
      </Btn>
      <Btn onPress={onGoForwardPress} disabled={onGoForwardPress === null}>
        <Feather name='arrow-right' size={20} color={onGoForwardPress === null ? Colors.greyBlue : Colors.primaryText} />
      </Btn>
    </Row>
    <Row width='60%' align='center' justify='space-between' paddingRight='medium' paddingLeft='medium' >
      <Btn onPress={onMenuPress} disabled={disabled}>
        <TWIcon name='dapps' size={20} color={Colors.primaryText} />
      </Btn>
      <Btn onPress={onSearchPress} disabled={disabled} >
        <Feather name='search' size={20} color={Colors.primaryText} />
      </Btn>
      {isBookmark ? (
        <Btn onPress={onBookMarkPress} disabled={disabled}>
          <Animatable.Text animation='pulse' easing='ease-out' iterationCount={5} delay={500} >
            <Ionicons name='md-star' size={20} color={Colors.primaryText} />
          </Animatable.Text>
        </Btn>
      ) : (
        <Btn onPress={onBookMarkPress} disabled={disabled}>
          <Ionicons name='ios-star-outline' size={20} color={Colors.primaryText} />
        </Btn>
      )}
    </Row>
  </WebViewFooterWrapper>
)

WebViewFooter.propTypes = {
  onGobackPress: PropTypes.func,
  onGoForwardPress: PropTypes.func,
  onMenuPress: PropTypes.func,
  onSearchPress: PropTypes.func,
  onBookMarkPress: PropTypes.func
}

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
