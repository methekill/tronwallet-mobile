import React from 'react'
import { ScrollView } from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import styled from 'styled-components'
import { storiesOf } from '@storybook/react-native'

import { Colors, FontSize, ButtonSize } from './DesignSystem'

const Container = styled.View`
  padding: 10px;
  flex: 1;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  flex-direction: row;
`

const ColorItem = styled.View`
  width: 30px;
  height: 30px;  
  border-width: 0.98;
  border-color: #000;
  background-color: ${props => props.bgColor || 'red'};
`

const LinearColorItem = styled(LinearGradient)`
  width: 30px;
  height: 30px;  
  border-width: 0.98;
  border-color: #000;
`

const Small = styled.Text`
  margin-top: 5px;
  font-size: 10px;
  color: #ccc;
  text-align: center;
`

const WrapperItem = styled.View`
  margin: 10px;
  justify-content: flex-start;
  align-items: center;
  align-content: flex-start;
  width: 100px;
  height: 50px;
`

const Title = styled.Text`
  font-size: 20px;
  color: #000;
  width: 100%;
  padding-bottom: 30px;
`

const Text = styled.Text`
  font-family: ${props => `Rubik-${props.font}`};
  color: #000;
  font-size: ${props => props.fontSize || 10};
`
Text.defaultProps = {
  font: 'Regular'
}

const Row = styled.View`
  width: 100%;
  padding: 20px;
`

const Button = styled.TouchableOpacity`
  height: 40px;
  width: ${props => props.width}%;
  border-color: #000;
  border-width: 2px;
  justify-content: center;
  align-items: center;
`

const simpleColors = Object.keys(Colors).filter(color => color !== 'RGB' && !Array.isArray(Colors[color]))
const RGBColors = Object.keys(Colors.RGB)
const gradientColors = Object.keys(Colors).filter(color => Array.isArray(Colors[color]))

const fonts = ['Bold', 'Light', 'Black', 'Medium', 'Regular']

storiesOf('DesignSystem')
  .addDecorator(getStory => <ScrollView><Container>{getStory()}</Container></ScrollView>)
  .add('Colors', () => (
    <React.Fragment>
      <Title>Colors</Title>
      {simpleColors.map(item => (
        <WrapperItem key={item}>
          <ColorItem bgColor={Colors[item]} />
          <Small>{item} - {Colors[item]}</Small>
        </WrapperItem>
      ))}
      <Title>RGB Colors</Title>
      {RGBColors.map(item => (
        <WrapperItem key={item}>
          <ColorItem bgColor={`rgb(${Colors.RGB[item]})`} />
          <Small>{item} - {Colors.RGB[item]}</Small>
        </WrapperItem>
      ))}
      <Title>Gradient Colors</Title>
      {gradientColors.map(item => (
        <WrapperItem key={item}>
          <LinearColorItem colors={Colors[item]} />
          <Small>{item} - {Colors[item]}</Small>
        </WrapperItem>
      ))}
    </React.Fragment>
  ))
  .add('FontSize', () => (
    <React.Fragment>
      {fonts.map(font => (
        <React.Fragment key={font}>
          <Title>Rubik-{font}</Title>
          {Object.keys(FontSize).map(item => (
            <Row key={item}>
              <Text fontSize={FontSize[item]} font={font} >{item}</Text>
            </Row>
          ))}
        </React.Fragment>
      ))}
    </React.Fragment>
  ))
  .add('ButtonSize', () => (
    <React.Fragment>
      <Title>ButtonSize</Title>
      {Object.keys(ButtonSize).map(size => (
        <Row key={size} >
          <Button width={ButtonSize[size]}>
            <Text>{size}</Text>
          </Button>
        </Row>
      ))}
    </React.Fragment>
  ))
