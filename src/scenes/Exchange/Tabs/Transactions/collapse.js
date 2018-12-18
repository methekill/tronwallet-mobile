import React, { Component } from 'react'
import { View, LayoutAnimation, Platform, UIManager, Animated, TouchableOpacity } from 'react-native'
import PropTypes from 'prop-types'

class CollapseView extends Component {
  constructor () {
    super()
    this.state = {
      expanded: false
    }
    if (Platform.OS === 'android') UIManager.setLayoutAnimationEnabledExperimental(true)
  }

  collapse = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    this.setState({expanded: !this.state.expanded})
  }

  render () {
    const { renderView, renderCollapseView, containerStyle } = this.props
    return (
      <Animated.View style={[{...containerStyle}, {overflow: 'hidden'}]}>
        <TouchableOpacity
          onPress={this.collapse}>
          {renderView(this.state.expanded)}
        </TouchableOpacity>
        {this.state.expanded &&
        <View>
          {renderCollapseView(this.state.expanded)}
        </View>}
      </Animated.View>
    )
  }
}

CollapseView.propTypes = {
  renderView: PropTypes.func.isRequired,
  renderCollapseView: PropTypes.func.isRequired,
  containerStyle: PropTypes.object
}

export default CollapseView
