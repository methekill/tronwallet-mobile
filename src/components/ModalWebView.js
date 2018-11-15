import React, { Component } from 'react'
import { Modal, WebView } from 'react-native'
import * as Utils from './Utils'
import Loading from './LoadingScene'
import NavigationHeader from './Navigation/Header'

class ModalWebView extends Component<{}> {
  state = {
    modalVisible: false,
    uri: this.props.uri
  }

  open = (uri) => this.setState({
    modalVisible: true,
    uri
  })

  render () {
    return (
      <Modal
        animationType='slide'
        transparent={false}
        visible={this.state.modalVisible}
        onRequestClose={() => this.setState({ modalVisible: false })}
      >
        <Utils.SafeAreaView>
          <NavigationHeader onBack={() => { this.setState({ modalVisible: false }) }} />
          <WebView
            source={{ uri: this.state.uri }}
            renderLoading={() => <Loading />}
            startInLoadingState
          />
        </Utils.SafeAreaView>
      </Modal>
    )
  }
}

ModalWebView.displayName = 'ModalWebView'

export default ModalWebView
