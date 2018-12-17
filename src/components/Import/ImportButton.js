import React from 'react'
import { ActivityIndicator } from 'react-native'
import { func, bool } from 'prop-types'

import tl from '../../utils/i18n'
import { Colors } from '../DesignSystem'
import ButtonGradient from '../ButtonGradient'

const ImportButton = ({ loading, onPress, disabled }) =>
  loading
    ? (<ActivityIndicator size='small' color={Colors.primaryText} />)
    : (
      <ButtonGradient
        font='bold'
        text={tl.t('importWallet.button')}
        onPress={onPress}
        disabled={disabled}
      />
    )

ImportButton.propTypes = {
  loading: bool,
  onPress: func.isRequired,
  disabled: bool
}

ImportButton.defaultProps = {
  loading: false,
  disabled: false
}

export default ImportButton
