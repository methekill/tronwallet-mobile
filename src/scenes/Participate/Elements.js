import React from 'react'
import styled, { css } from 'styled-components'
import { View } from '../../components/Utils'
import { Colors, Spacing, FontSize } from '../../components/DesignSystem'
import LinearGradient from 'react-native-linear-gradient'

export const Text = styled.Text`
  color: white;
  font-family: 'Rubik-Regular';
  font-size: 10;
`
export const TextId = Text.extend`
  margin-left: 5;
  font-size: 9;
`
export const TokenPrice = styled.Text`
  color: white;
  font-size: 14;
  font-family: 'Rubik-Medium';
`

export const FeaturedTokenPrice = TokenPrice.extend`
  font-size: 18;
  line-height: 18px;
  height: 18px;
`

export const TokenName = TokenPrice.extend`
  font-size: 13;
`

export const FeaturedTokenName = TokenName.extend`
  font-size: 13;
  font-family: 'Rubik-Bold';
`

export const Card = View.extend`
  min-height: 85;
  overflow: hidden;
  flex-direction: row;
  padding: 19px 15px 15px 15px;
`

export const CardContent = View.extend`
  flex-direction: row;
  padding: 19px 15px 15px 15px;
`

export const Featured = View.extend`
  height: 14;
  padding-horizontal: 4px;
  background: rgb(255,65,101);
  border-radius: 3;
`

export const FeaturedText = Text.extend`
  font-size: 9;
  font-family: 'Rubik-Medium';
  margin: 2px;
  text-align: center;
`

export const VerticalSpacer = styled.View`
  height: ${props => props.size};
`

export const DividerSpacer = styled.View`
  height: 1px;
  background: ${Colors.dusk};
  ${props => props.size && css`margin-vertical:${Spacing[props.size]}px`}
  ${props => props.marginX && css`margin-horizontal:${Spacing[props.marginX]}px`}
`

export const HorizontalSpacer = styled.View`
  width: ${props => props.size};
`

export const BuyContainer = styled.View`
  padding: 11.9px 33px 0px 31px;
`

export const MarginFixer = styled.View`
  margin-left: 27;
  margin-right: 29;
`

export const BuyText = styled.Text`
  text-align: center;
  font-size: 13;
  font-family: Rubik-Medium;
  letter-spacing: 0.7;
  color: ${props => props.white ? Colors.primaryText : Colors.secondaryText};
`

export const WhiteBuyText = BuyText.extend`
  text-align: right;
  color: rgb(221, 222, 231);
`

export const AmountText = WhiteBuyText.extend`
  color: rgb(225, 225, 225);
  font-size: 40;
`

export const TrxValueText = AmountText.extend`
  font-size: 16;
`

export const MoreInfoButton = styled.View`
  align-self: center;
  background: rgb(116, 118, 162);
  height: 50;
  width: 151;
  border-radius: 4;
  justify-content: center;
`

export const ButtonText = styled.Text`
  color: white;
  font-family: 'Rubik-Bold';
  font-size: 12;
  text-align: center;
  letter-spacing: 0.8;
`
ButtonText.defaultProps = {
  numberOfLines: 1
}

export const BuyButton = styled.TouchableOpacity`
  background-color: ${Colors.darkThree};
  border-radius: 5px;
  justify-content: center;
  align-items: center;
  padding-vertical: 7px;
  min-width: 90px;
  max-width: 110px;
  box-shadow: 1px 2px #000;
  elevation: ${props => props.elevation || 2};
`
export const TokensTitle = styled.Text`
  font-family: Rubik-Medium;
  font-size: 15px;
  color: ${Colors.primaryText};
  margin-left: 15px;
`
export const LabelText = styled.Text`
  font-family: Rubik-Bold;
  font-size: ${props => FontSize[props.size]};
  color: ${Colors.primaryText};
`
export const TronIcon = styled.Image`
  height: 28px;
  width: 28px;
`
export const PercentageView = View.extend`
  transform: translateY(-5px);
`
function labelSize (length) {
  if (length < 5) return 'average'
  if (length < 6) return 'small'
  return 'xsmall'
}
export const TokenLabel = ({label}) =>
  <LinearGradient
    start={{ x: 0.4, y: 0 }}
    end={{ x: 1, y: 1 }}
    colors={[Colors.primaryGradient[0], Colors.primaryGradient[1]]}
    style={{width: 60, height: 60, borderRadius: 4, alignItems: 'center', justifyContent: 'center'}}>
    <View flex={1} align='center' justify='center'>
      <LabelText font='bold' size={labelSize(label.length)}>{label}</LabelText>
    </View>
  </LinearGradient>

export const WhiteLabelText = ({label}) =>
  <View borderRadius={4} background='white' align='center' justify='center' height={60} width={60}>
    <LabelText style={{color: Colors.buttonGradient[2]}} size={labelSize(label.length)} font='bold'>
      {label}
    </LabelText>
  </View>

export const GradientCard = (props) =>
  <LinearGradient
    start={{ x: 0, y: 0.5 }}
    end={{ x: 1, y: 1 }}
    colors={[Colors.primaryGradient[0], Colors.primaryGradient[1]]}
    style={{flex: 1, padding: 10, flexDirection: 'row', borderRadius: 5, marginHorizontal: 15, marginVertical: 10}}>
    {props.children}
  </LinearGradient>
