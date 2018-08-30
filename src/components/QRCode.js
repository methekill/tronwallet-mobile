import React, { Component } from 'react'
import { View, ActivityIndicator } from 'react-native'
import PropTypes from 'prop-types'
import LinearGradient from 'react-native-linear-gradient'
import RNQRCode from 'react-native-qrcode'
import { Colors } from './DesignSystem'
import GrowIn from './Animations/GrowIn'
import FadeIn from './Animations/FadeIn'

const BORDER_RADIUS = 5
class QRCode extends Component {
  state = {
    loading: true
  }

  componentDidMount () {
    this.props.onLoad()
  }

  render () {
    const { size, value, bgColor, fgColor, loading } = this.props
    return (
      loading ? (
        <View height={size + 61} justifyContent='center'>
          <GrowIn name='loading'>
            <ActivityIndicator size='small' color={Colors.primaryText} />
          </GrowIn>
        </View>
      ) : (
        <FadeIn name='qrcode'>
          <View
            style={{
              padding: 10,
              borderRadius: BORDER_RADIUS
            }}
          >

            <LinearGradient
              start={{ x: 0, y: 1 }}
              end={{ x: 1, y: 0 }}
              colors={[Colors.primaryGradient[0], Colors.primaryGradient[1]]}
              style={{ padding: 1, borderRadius: BORDER_RADIUS }}
            >
              <View
                style={{
                  padding: 12,
                  backgroundColor: bgColor,
                  borderRadius: BORDER_RADIUS
                }}
              >
                <View
                  style={{
                    padding: 5,
                    backgroundColor: fgColor,
                    borderRadius: BORDER_RADIUS
                  }}
                >
                  {loading || (
                    <RNQRCode
                      value={value}
                      size={size}
                      bgColor={bgColor}
                      fgColor={fgColor}
                    />
                  )}
                </View>
              </View>
            </LinearGradient>
          </View>
        </FadeIn>
      )
    )
  }
}

QRCode.propTypes = {
  size: PropTypes.number.isRequired,
  value: PropTypes.string.isRequired,
  bgColor: PropTypes.string,
  fgColor: PropTypes.string
}

QRCode.defaultProps = {
  bgColor: Colors.background,
  fgColor: '#ededed'
}

export default QRCode
