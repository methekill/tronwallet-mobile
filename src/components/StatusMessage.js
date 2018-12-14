import React, { Component } from 'react'
import { SafeAreaView } from 'react-native'

import * as Utils from './Utils'
import { Colors } from './DesignSystem'
import { getSystemStatus } from './../services/contentful'
import { logSentry } from './../utils/sentryUtils'

class StatusMessage extends Component {
  static displayName = 'StatusMessage'

  state = {
    showStatus: false,
    statusMessage: '',
    statusColor: '',
    messageColor: '',
    systemAddress: {},

    isFecthing: false
  }

  componentDidMount () {
    this._updateSystemStatus()
  }

  checkStatus = () => this._updateSystemStatus()

  _reset = () => {
    this.setState({
      showStatus: false,
      statusMessage: '',
      statusColor: '',
      messageColor: '',
      isFecthing: false
    })
  }

  _updateSystemStatus = () => {
    if (this.state.isFecthing) {
      return null
    }

    try {
      this.setState({ isFecthing: true })
      getSystemStatus()
        .then(data => {
          const { systemStatus, systemAddress } = data
          this.setState({
            ...systemStatus,
            systemAddress,
            isFecthing: false
          })
        })
    } catch (error) {
      this._reset()
      logSentry(error, 'App - can\'t get system status')
    }
  }

  render () {
    const { statusColor, statusMessage, messageColor, showStatus } = this.state
    if (!showStatus) {
      return null
    }

    return (
      <SafeAreaView>
        <Utils.View padding={5} background={statusColor || Colors.background}>
          <Utils.Text size='tiny' font='regular' align='center' color={messageColor || Colors.primaryText}>
            {statusMessage}
          </Utils.Text>
        </Utils.View>
      </SafeAreaView>
    )
  }
}

export default StatusMessage
