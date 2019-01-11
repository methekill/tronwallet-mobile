import React, { PureComponent } from 'react'
import { View } from 'react-native'
import styled from 'styled-components'
import { Text } from '../../components/Utils'
import ActionSheet from 'react-native-actionsheet'
import Switch from 'react-native-switch-pro'

import { Colors } from '../../components/DesignSystem'
import tl from './../../utils/i18n'

const Center = styled.View`
  flex-direction: row;
  justify-content: center;
  align-content: center;
  align-items: center;
`

export class AutoSignSelector extends PureComponent {
  state = {
    active: false
  }

  _formatSignText = (option) => {
    if (!option.value) return option.text

    return `Auto sign will be enabled for ${option.text}`
  }

  render () {
    const { autoSign, options, onChange } = this.props

    return (
      <Center>
        <View>
          <Switch
            circleStyle={{ backgroundColor: Colors.orange }}
            backgroundActive={Colors.yellow}
            backgroundInactive={Colors.secondaryText}
            value={this.state.active}
            onAsyncPress={(callback) => {
              this.setState({ active: true }, () => {
                callback(this.state.active)
                if (this.state.active) {
                  this.ActionSheet.show()
                }
              })
            }}
          />
        </View>
        <View>
          <Text marginY='16'>{tl.t('contract.card.switchLabel')}</Text>
          <Text light marginY='16' color={Colors.greyBlue} size='smaller'>{this._formatSignText(autoSign)}</Text>
        </View>
        <ActionSheet
          ref={ref => {
            this.ActionSheet = ref
          }}
          title={tl.t('contract.options.title')}
          options={options.map(({text}) => text)}
          cancelButtonIndex={0}
          onPress={index => onChange(options[index])}
        />
      </Center>
    )
  }
}
