import React from 'react'
import styled from 'styled-components'
import { addDecorator } from '@storybook/react-native'
import { ScrollView, StyleSheet } from 'react-native'

import { Colors } from './../src/components/DesignSystem'

const Container = styled.View`
  padding: 10px;
  flex: 1;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  flex-direction: row;
  background-color: ${Colors.background};
`

addDecorator(getStory => (
  <ScrollView style={StyleSheet.absoluteFill}>
    <Container>{getStory()}</Container>
  </ScrollView>
))

