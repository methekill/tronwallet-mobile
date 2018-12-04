import React from 'react'
import { View, StyleSheet, TouchableOpacity } from 'react-native'

import { Colors } from './DesignSystem'
import * as Utils from './Utils'

const SelectorTile = ({options, onItemPress, itemSelected}) => (
  <View style={styles.wrapper}>
    <Utils.Row align='center'>
      {options.map(({label, value}) => (
        <TouchableOpacity
          style={[styles.option,
            {
              flexGrow: (1 / options.length),
              backgroundColor: itemSelected === label ? Colors.lightestBackground : Colors.lightPurple
            }]}
          onPress={() => onItemPress(value)}
          key={label}
          disabled={itemSelected === label}>
          <Utils.Text size='tiny'>{label}</Utils.Text>
        </TouchableOpacity>
      ))}
    </Utils.Row>
  </View>
)

export default SelectorTile

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: Colors.lighterBackground,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: Colors.lighterBackground,
    padding: 1
  },
  option: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 5,
    marginVertical: 2,
    marginHorizontal: 4
  }
})
