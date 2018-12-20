import React, { Component } from 'react'
import { WebView, Alert } from 'react-native'
import withContext from '../../utils/hocs/withContext'

import { HeaderContainer, PageWrapper, HeaderView, URLInput, BlankPage, WebViewLimit } from './elements'
import { FloatingIconButton } from '../../components/Navigation/elements'

class TronWebView extends Component {
  constructor (props) {
    super(props)

    this.webview = null
    this.state = {
      initialized: false,
      url: null,
      isPageVisible: false
    }
  }

  handleMessage = (ev) => {
    const { accounts } = this.props.context
    const { balance, address } = accounts.find(acc => acc.alias === '@main_account')

    try {
      const contract = JSON.parse(ev.nativeEvent.data)
      if ((!balance && balance !== 0) || !address) {
        throw new Error('Invalid contract, try again or contact the support for help')
      }

      if (balance < contract.amount) {
        throw new Error('You dont have enought amount to run this contract')
      }

      this.props.navigation.navigate('ContractPreview', { ...contract, prevRoute: 'TronWebview' })
    } catch (e) {
      Alert.alert(e.message)
    }
  }

  _sendMessage = (type, payload) => {
    this.webview.postMessage(JSON.stringify({
      type,
      payload
    }))
  }

  configInstance = () => {
    const { accounts } = this.props.context
    const { balance, address, tronPower, confirmed } = accounts.find(acc => acc.alias === '@main_account')

    if (this.webview) {
      this._sendMessage('ADDRESS', {
        balance: balance, address, tronPower, confirmed
      })

      this.setState({ initialized: true })
    }
  }

  injectDebuggScript = () => {
    return `
      document.addEventListener("message", function(data) {
        var JData = JSON.parse(data.data);
        alert(data.data)
      });
    `
  }

  injectjs () {
    let jsCode = `      
        var script   = document.createElement("script");
        script.type  = "text/javascript";
        script.text  = "function callTronWallet(data) {postMessage(JSON.stringify(data))}"
        document.body.appendChild(script);
        document.useragent = "TronWallet1.3"
    `

    return jsCode
  }

  render () {
    const { isPageVisible, url } = this.state

    return (
      <PageWrapper>
        <HeaderContainer>
          <FloatingIconButton onBack={() => this.props.navigation.goBack()} zIndex={10} />
          <HeaderView>
            <URLInput
              placeholder='URL'
              keyboardType='url'
              onSubmitEditing={() => this.setState({ isPageVisible: true })}
              value={url}
              onChangeText={url => this.setState({ url, isPageVisible: false })}
            />
          </HeaderView>

        </HeaderContainer>

        { isPageVisible ? (
          <WebView
            style={{ display: 'flex', flex: 1, height: '100%' }}
            ref={(ref) => (this.webview = ref)}
            javaScriptEnabled
            automaticallyAdjustContentInsets
            injectedJavaScript={this.injectjs()}
            onLoadEnd={this.configInstance}
            onMessage={this.handleMessage}
            source={{uri: url}} />
        ) : <BlankPage />}

        <WebViewLimit />

      </PageWrapper>
    )
  }
}

export default withContext(TronWebView)
