import React from 'react'
import { Image } from 'react-native'

import * as Utils from './Utils'

const Logo = () => (
  <Utils.Content justify='center' align='center'>
    <Utils.VerticalSpacer size='small' />
    <Image source={require('../assets/logo-circle.png')} style={{ height: 100 }} resizeMode='contain' />
    <Utils.VerticalSpacer size='small' />
    <Utils.Text size='medium'>TRONWALLET</Utils.Text>
  </Utils.Content>
)

export default Logo
