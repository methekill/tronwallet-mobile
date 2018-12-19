import React, { PureComponent } from 'react'
import { Image, StyleSheet } from 'react-native'

import tl from '../../utils/i18n'
import * as Elements from './elements'
import LottieView from 'lottie-react-native'

class Empty extends PureComponent {
  componentDidMount () {
    if (this.lottie) {
      this.lottie.play()
    }
  }

  componentWillUnmount () {
    if (this.lottie) {
      this.lottie.reset()
    }
  }

  renderWorldLoading = () => (
    <LottieView
      ref={ref => { this.lottie = ref }}
      source={require('./../../assets/animations/world_locations.json')}
      loop
      style={styles.images}
    />
  )

  renderImage () {
    return (
      <React.Fragment>
        <Image
          source={require('../../assets/empty.png')}
          resizeMode='contain'
          style={styles.images}
        />
        <Elements.EmptyScreenText>
          {tl.t('transactions.notFound')}
        </Elements.EmptyScreenText>
      </React.Fragment>
    )
  }

  render () {
    const { loading } = this.props
    return (
      <Elements.EmptyScreenContainer>
        {loading
          ? this.renderWorldLoading()
          : this.renderImage()}
      </Elements.EmptyScreenContainer>
    )
  }
}

const styles = StyleSheet.create({
  images: {
    width: 200,
    height: 200
  }
})

export default Empty
