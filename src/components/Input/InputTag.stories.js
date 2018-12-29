import React from 'react'

import { storiesOf } from '@storybook/react-native'
import Input from './InputTag'

storiesOf('InputTag')
  .add('Default', () => (<Input onChangeText={() => null} />))

