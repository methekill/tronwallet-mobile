import React, { PureComponent } from 'react'
import { Vibration, Platform } from 'react-native'
import Ionicons from 'react-native-vector-icons/Ionicons'
import * as Animatable from 'react-native-animatable'
import PropTypes from 'prop-types'

import { PinDigit, KeyPad, Key, PinWrapper } from './elements'
import * as Utils from '../../components/Utils'
import { Colors } from '../../components/DesignSystem'

class PinPad extends PureComponent {
  static propTypes = {
    onComplete: PropTypes.func
  }

  static defaultProps = {
    onComplete: () => null
  }

  state = {
    pin: []
  }

  componentDidUpdate (_, prevState) {
    if (this.state.pin.length > prevState.pin.length && this.state.pin.length === 6) {
      setTimeout(() => {
        this.props.onComplete(this.state.pin.join(''), this.state.pin)
      }, 500)
    }
  }

  reset = () => this._handleClear()

  shake = () => {
    Vibration.vibrate(500)
    this.pinView.shake(1000)
      .then(endState => {
        if (endState.finished) {
          Vibration.cancel()
        }
      })
      .catch(() => {
        Vibration.cancel()
      })
  }

  _checkPin = () => {
    if (this.state.pin.length === 6) {
      this.props.onComplete(this.state.pin.join(''), this.state.pin)
    }
  }

  _handleKeyInput = digit => {
    const { pin } = this.state
    Vibration.vibrate(30)
    if (pin.length < 6) {
      this.setState({
        pin: pin.concat(parseInt(digit))
      }, () => {
        if (Platform.OS === 'ios') {
          Vibration.cancel()
        }
      })
    }
  }

  _handleDelete = () => {
    const { pin } = this.state

    this.setState({
      pin: pin.slice(0, -1)
    })
  }

  _handleClear = () => {
    this.setState({ pin: [] })
  }

  render () {
    const { pin } = this.state
    return (
      <Utils.View marginBottom={10}>
        <PinWrapper>
          <Animatable.View ref={ref => { this.pinView = ref }} >
            <Utils.Row align='center' justify='space-between' width={264}>
              <PinDigit digit={0} currentState={pin} />
              <PinDigit digit={1} currentState={pin} />
              <PinDigit digit={2} currentState={pin} />
              <PinDigit digit={3} currentState={pin} />
              <PinDigit digit={4} currentState={pin} />
              <PinDigit digit={5} currentState={pin} />
            </Utils.Row>
          </Animatable.View>
        </PinWrapper>

        <KeyPad>
          <Key onPress={this._handleKeyInput}>1</Key>
          <Key onPress={this._handleKeyInput}>2</Key>
          <Key onPress={this._handleKeyInput}>3</Key>
          <Key onPress={this._handleKeyInput}>4</Key>
          <Key onPress={this._handleKeyInput}>5</Key>
          <Key onPress={this._handleKeyInput}>6</Key>
          <Key onPress={this._handleKeyInput}>7</Key>
          <Key onPress={this._handleKeyInput}>8</Key>
          <Key onPress={this._handleKeyInput}>9</Key>
          <Key disabled noBorder />
          <Key onPress={this._handleKeyInput}>0</Key>
          <Key
            onPress={this._handleDelete}
            onLongPress={this._handleClear}
            pointerEvents={pin.length === 0 ? 'none' : 'auto'}
          >
            <Ionicons name='ios-backspace' size={24} color={Colors.secondaryText} />
          </Key>
        </KeyPad>
      </Utils.View>
    )
  }
}

export default PinPad
