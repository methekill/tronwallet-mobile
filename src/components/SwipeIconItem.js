import React, { Component } from 'react'
import { View, StyleSheet, Animated, PanResponder } from 'react-native'
import PropTypes from 'prop-types'
import { Colors } from './DesignSystem'

const ITEM_SIZE = 30

/**
 * WIP - Only supports one item on the right
 */
class SwipeItem extends Component {
  constructor (props) {
    super(props)
    this.state = {
      position: new Animated.ValueXY()
    }

    this.gestureDelay = 10

    const panResponder = PanResponder.create({
      onStartShouldSetPanResponder: (evt, gestureState) => false,
      onMoveShouldSetPanResponder: (evt, gestureState) => true,
      onPanResponderTerminationRequest: (evt, gestureState) => false,
      onPanResponderMove: (evt, gestureState) => {
        if (gestureState.dx < -40 || gestureState.dx > 40) {
          let newX = gestureState.dx + this.gestureDelay
          this.state.position.setValue({x: newX, y: 0})
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        const defaultDuration = 160
        if (gestureState.dx > 50) {
          Animated.timing(this.state.position, {
            toValue: {x: 0, y: 0},
            duration: defaultDuration
          }).start(() => {
          })
        } else {
          Animated.timing(this.state.position, {
            toValue: {x: -50, y: 0},
            duration: defaultDuration
          }).start(() => {
          })
        }
      }
    })

    this.panResponder = panResponder
  }

  reset () {
    Animated.timing(this.state.position, {
      toValue: {x: 0, y: 0},
      duration: 150
    }).start()
  }

  render () {
    return (
      <View style={styles.container}>
        <Animated.View style={[this.state.position.getLayout()]} {...this.panResponder.panHandlers}>
          <View style={styles.absoluteCell}>
            {this.props.options.map((child, index) =>
              (<View key={index}>{child}</View>))
            }
          </View>
          <View style={styles.options}>
            {this.props.item}
          </View>
        </Animated.View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    marginRight: -ITEM_SIZE
  },
  absoluteCell: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    width: ITEM_SIZE,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center'
  },
  options: {
    marginRight: ITEM_SIZE,
    backgroundColor: Colors.background,
    padding: 5,
    alignItems: 'center'
  }
})

SwipeItem.propTypes = {
  options: PropTypes.array,
  item: PropTypes.object
}

export default SwipeItem
