import React, { PureComponent } from 'react'
import { TouchableOpacity } from 'react-native'
import styled from 'styled-components'
import { Text } from '../../components/Utils'
import ActionSheet from 'react-native-actionsheet'

const TouchableContainer = styled(TouchableOpacity)`
  flex: 1;
  justify-content: center;
  align-items: center;
`

export class AutoSignSelector extends PureComponent {
  _formatSignText = (option) => {
    if (!option.value) return option.text

    return `Auto sign will be enabled for ${option.text}`
  }

  render () {
    const { autoSign, options, onChange } = this.props

    return (
      <TouchableContainer onPress={() => this.ActionSheet.show()}>
        <Text size='smaller'>{this._formatSignText(autoSign)}</Text>
        <ActionSheet
          ref={ref => {
            this.ActionSheet = ref
          }}
          title={'Setting this option, all the trigger smart contracts comming from this address and calling that function will be automatically signed'}
          options={options.map(({text}) => text)}
          cancelButtonIndex={0}
          onPress={index => onChange(options[index])}
        />
      </TouchableContainer>
    )
  }
}
