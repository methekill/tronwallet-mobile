import React, { PureComponent, Fragment } from 'react'
import { Clipboard } from 'react-native'
import { func } from 'prop-types'

import { HorizontalSpacer } from '../Utils'
import IconButton from '../IconButton'

class InputOptions extends PureComponent {
  static propTypes = {
    onPressScanner: func.isRequired,
    onPaste: func.isRequired
  }

  async _onPaste () {
    const content = await Clipboard.getString()
    this.props.onPaste(content)
  }

  render () {
    const { onPressScanner } = this.props

    return (
      <Fragment>
        <IconButton onPress={this._onPaste} icon='md-clipboard' />
        <HorizontalSpacer />
        <IconButton onPress={onPressScanner} icon='ios-qr-scanner' />
      </Fragment>
    )
  }
}

export default InputOptions
