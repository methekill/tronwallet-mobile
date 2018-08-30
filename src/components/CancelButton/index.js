import React from 'react'
import PropTypes from 'prop-types'

import { CancelButton, CancelText } from './elements'

const CancelButtonComponent = ({onCancel, navigation}) => {
  const goBack = () => { navigation.goBack() }

  return (
    <CancelButton onPress={onCancel || goBack}>
      <CancelText>CANCEL</CancelText>
    </CancelButton>
  )
}

CancelButtonComponent.propTypes = {
  onCancel: PropTypes.func,
  navigation: function (props, propName, componentName) {
    if (!props['onCancel'] && !props['navigation']) {
      return new Error(
        'Please provide either an onCancel callback or the navigation object to CancelButton.'
      )
    }
  }
}

export default CancelButtonComponent
