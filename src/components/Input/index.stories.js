import React from 'react'
import Feather from 'react-native-vector-icons/Feather'
import { storiesOf } from '@storybook/react-native'
import Input from './index'

storiesOf('Input')
  .add('Default', () => (<Input onChangeText={() => null} />))
  .add('Left Content', () => (
    <Input
      leftContent={() => <Feather name='share-2' color='white' size={18} />}
      onChangeText={() => null}
    />
  ))
  .add('Right Content', () => (
    <Input
      rightContent={() => <Feather name='share-2' color='white' size={18} />}
      onChangeText={() => null}
    />
  ))
  .add('Right And Left Content', () => (
    <Input
      leftContent={() => <Feather name='share-2' color='white' size={18} />}
      rightContent={() => <Feather name='share-2' color='white' size={18} />}
      onChangeText={() => null}
    />
  ))
