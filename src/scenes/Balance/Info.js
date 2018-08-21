import React from 'react'
import { Motion, spring } from 'react-motion'
import * as Utils from '../../components/Utils'

const Info = ({ label, value, precision = 0 }) => (
  <Utils.View align='center'>
    <Utils.Text size='xsmall' secondary>{label}</Utils.Text>
    <Motion
      defaultStyle={{ power: 0 }}
      style={{ power: spring(value) }}
    >
      {value => (
        <Utils.Text padding={4}>{`${value.power.toFixed(precision)}`}</Utils.Text>
      )}
    </Motion>
  </Utils.View>
)

export default Info
