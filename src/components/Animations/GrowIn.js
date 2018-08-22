import React, { Component } from 'react'
import { View } from 'react-native'
import { Motion, spring } from 'react-motion'

class GrowIn extends Component {
  getStyles = () => ({ height: spring(this.props.height) })

  getDefaultStyles = () => ({ height: 0 })

  render () {
    const { children } = this.props
    return (
      <Motion defaultStyles={this.getDefaultStyles()} style={this.getStyles()}>
        {interpolatingStyle => (
          <View
            style={{
              ...interpolatingStyle,
              overflow: 'hidden'
            }}
          >
            {children}
          </View>
        )}
      </Motion>
    )
  }
}

export default GrowIn
