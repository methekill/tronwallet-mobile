import React, { PureComponent } from 'react'
import { func } from 'prop-types'

import tl from '../../utils/i18n'
import { FormInput } from '../Utils'

class MnemonicInput extends PureComponent {
  static propTypes = {
    onChangeText: func,
    onEnter: func
  }

  static defaultProps = {
    onChangeText: () => {},
    onEnter: () => {}
  }

  state = {
    seed: ''
  }

  _onKeyPress = event => {
    if (event.nativeEvent.key === 'Enter') {
      this.props.onEnter()
    }
  }

  _onChangeText = (seed) => {
    this.setState({ seed })
    this.props.onChangeText(seed)
  }

  render () {
    const { seed } = this.state

    return (
      <FormInput
        testID='restoreInput'
        placeholder={tl.t('seed.restore.placeholder')}
        height={90}
        padding={16}
        multiline
        underlineColorAndroid='transparent'
        blurOnSubmit
        numberOfLines={4}
        autoCapitalize='none'
        autoCorrect={false}
        value={seed}
        onChangeText={this._onChangeText}
        onKeyPress={this._onKeyPress}
      />
    )
  }
}

export default MnemonicInput
