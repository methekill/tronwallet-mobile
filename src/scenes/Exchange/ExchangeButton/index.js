import React from 'react'
import { ActivityIndicator } from 'react-native'
import LottieView from 'lottie-react-native'
import PropTypes from 'prop-types'

import ButtonGradient from '../../../components/ButtonGradient'
import tl from '../../../utils/i18n'
import * as Utils from '../../../components/Utils'
import { Colors } from '../../../components/DesignSystem'

const ExchangeButton = ({loading, result, onSubmit}) => {
  if (loading) {
    return <Utils.View align='center' justify='center'>
      <ActivityIndicator color={Colors.primaryText} />
    </Utils.View>
  }
  if (result) {
    return result === 'success'
      ? <LottieView
        source={require('../../../assets/animations/checked_done_.json')}
        autoPlay
        loop={false}
        resizeMode='cover'
        style={{ width: 80, height: 80, alignSelf: 'center' }}
      />
      : <Utils.Text size='small' color={Colors.redError}>
        {result}
      </Utils.Text>
  }
  return <ButtonGradient
    font='bold'
    text={tl.t('buy').toUpperCase()}
    onPress={onSubmit}
    disabled={loading}
  />
}

ExchangeButton.propTypes = {
  loading: PropTypes.bool.isRequired,
  result: PropTypes.oneOfType([ PropTypes.string, PropTypes.bool ]).isRequired,
  onSubmit: PropTypes.func.isRequired
}
ExchangeButton.defaultProps = {
  loading: false,
  result: null
}
export default ExchangeButton
