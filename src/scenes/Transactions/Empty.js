import React from 'react'
import { Image } from 'react-native'

import tl from '../../utils/i18n'
import * as Elements from './elements'
import LottieView from 'lottie-react-native'

const WorldLoading = () => (
  <LottieView
    source={require('./../../assets/animations/world_locations.json')}
    autoPlay
    loop
    style={{ width: 200, height: 200 }}
  />
)

const Empty = ({loading}) => (
  <Elements.EmptyScreenContainer>
    {loading ? <WorldLoading /> : (
      <React.Fragment>
        <Image
          source={require('../../assets/empty.png')}
          resizeMode='contain'
          style={{ width: 200, height: 200 }}
        />
        <Elements.EmptyScreenText>
          {tl.t('transactions.notFound')}
        </Elements.EmptyScreenText>
      </React.Fragment>
    )}
  </Elements.EmptyScreenContainer>
)

export default Empty
