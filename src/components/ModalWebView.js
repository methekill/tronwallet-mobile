import React, { Component } from 'react'
import { Modal, WebView } from 'react-native'
import Icon from 'react-native-vector-icons/Ionicons'
import styled from 'styled-components'
import * as Utils from './Utils'
import Loading from './LoadingScene'
import { Colors } from './DesignSystem'

const Button = styled.TouchableOpacity`
  width: 60px;
  height: 50px;
  justify-content: center;
  align-content: center;
  align-items: center;
`

const Title = styled(Utils.Text).attrs({
  color: 'white',
  size: 'smaller',
  font: 'regular',
  numberOfLines: 1,
  ellipsizeMode: 'tail'
})`
  padding: 0px 20px;
`

class ModalWebView extends Component<{}> {
  state = {
    modalVisible: false,
    uri: this.props.uri,
    title: ' '
  }

  open = (uri) => this.setState({
    modalVisible: true,
    uri
  })

  close = () => this.setState({
    modalVisible: false
  })

  handleMessage = (message) => {
    if (message.nativeEvent.data !== this.state.title) {
      this.setState({
        title: message.nativeEvent.data
      })
    }
  }

  render () {
    return (
      <Modal
        animationType='slide'
        transparent={false}
        visible={this.state.modalVisible}
        onRequestClose={this.close}
        style={{ backgroundColor: Colors.background }}
      >
        <Utils.SafeAreaView>
          <Utils.View height={50} align='flex-start' background={Colors.background} vertical>
            <Utils.View flex={0.1} height={50} width={60} align='center' justify='center'>
              <Button onPress={this.close}>
                <Icon name='ios-close' color='white' size={30} />
              </Button>
            </Utils.View>
            <Utils.View flex={0.9} height={50} justify='center'>
              <Title>{this.state.title}</Title>
            </Utils.View>
          </Utils.View>
          <WebView
            source={{ uri: this.state.uri }}
            style={{ backgroundColor: Colors.background }}
            renderLoading={() => <Loading />}
            startInLoadingState
            javaScriptEnabled
            injectedJavaScript={`
              (function() {
                var originalPostMessage = window.postMessage;
                var patchedPostMessage = function(message, targetOrigin, transfer) { 
                  originalPostMessage(message, targetOrigin, transfer);
                };
                patchedPostMessage.toString = function() { 
                  return String(Object.hasOwnProperty).replace('hasOwnProperty', 'postMessage'); 
                };
                window.postMessage = patchedPostMessage;
                window.postMessage(document.title)
              })();
            `}
            onMessage={this.handleMessage}
          />
        </Utils.SafeAreaView>
      </Modal>
    )
  }
}

ModalWebView.displayName = 'ModalWebView'

export default ModalWebView
