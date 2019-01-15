import React, { PureComponent } from 'react'
import { View } from 'react-native'
import styled from 'styled-components'
import { Text, Button } from '../../components/Utils'
import ActionSheet from 'react-native-actionsheet'
import Switch from 'react-native-switch-pro'

import { Colors } from '../../components/DesignSystem'
import tl from './../../utils/i18n'

const Content = styled.View`
  flex-direction: row;
  justify-content: flex-start;
  align-content: center;
  align-items: center;
  height: 40px;
  width: 100%;
`

export const Card = styled.View`  
  flex: 0.6;
  align-self: center;
  width: 100%;
  background-color: ${Colors.dusk};
  border-radius: 4px;
  align-items: center;
  justify-content: center;
`

export const Row = styled.View`  
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  height: 11%;
  background-color: transparent;
  padding-horizontal: ${({ noPadding }) => noPadding ? '0%' : '10%'};
`

export const Line = styled(Row)`
  width: 80%;
  height: 2px;
  background-color: ${Colors.slateGrey};
`

export const RejectButton = styled(Button)`
  border-radius: 4px;
  height: 50px;
  width: 100%;
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
      <Content>
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
        <View style={{ marginLeft: 20 }}>
          <Text size='smaller' numberOfLines={1} color={Colors.greyBlue}>{tl.t('contract.card.switchLabel')}</Text>
          {this.state.active && (
            <Text light color={Colors.greyBlue} size='tiny'>{this._formatSignText(autoSign)}</Text>
          )}
        </View>
        <ActionSheet
          ref={ref => {
            this.ActionSheet = ref
          }}
          title={tl.t('contract.card.options.title')}
          options={options.map(({ text }) => text)}
          cancelButtonIndex={0}
          onPress={index => {
            onChange(options[index])
            if (index === 0) {
              this.setState({
                active: false
              })
            }
          }}
        />
      </Content>
    )
  }
}
