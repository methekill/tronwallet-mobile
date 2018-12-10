import React from 'react'
import { ActivityIndicator } from 'react-native'
import PropTypes from 'prop-types'

import ButtonGradient from '../../components/ButtonGradient'
import * as Utils from '../../components/Utils'
import { Colors } from '../../components/DesignSystem'
import FadeIn from '../../components/Animations/FadeIn'

import tl from '../../utils/i18n'

const ExchangeButton = ({text, loading, result, onSubmit}) => {
  let element = null
  if (loading) {
    element = <ActivityIndicator color={Colors.primaryText} />
  } else if (result) {
    element = <FadeIn name='result'>
      <Utils.Text
        size={result === 'success' ? 'medium' : 'small'}
        color={result === 'success' ? Colors.green : Colors.redError}
        align='center'
        font='regular'
      >
        {result === 'success' ? `${tl.t('success')} ✓` : tl.t('exchange.error')}
      </Utils.Text>
    </FadeIn>
  } else {
    element = <ButtonGradient
      font='bold'
      text={text}
      onPress={onSubmit}
      disabled={loading}
    />
  }
  return <Utils.View paddingY='medium'>
    {element}
  </Utils.View>
}

ExchangeButton.propTypes = {
  loading: PropTypes.bool.isRequired,
  text: PropTypes.string.isRequired,
  result: PropTypes.oneOfType([ PropTypes.string, PropTypes.bool ]).isRequired,
  onSubmit: PropTypes.func.isRequired
}
ExchangeButton.defaultProps = {
  loading: false,
  result: null
}
export default ExchangeButton
