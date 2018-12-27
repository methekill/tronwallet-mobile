import React, { Component } from 'react'
import { WebView, Alert } from 'react-native'
import withContext from '../../utils/hocs/withContext'

import { HeaderContainer, PageWrapper, HeaderView, URLInput, BlankPage, WebViewLimit } from './elements'
import { FloatingIconButton } from '../../components/Navigation/elements'
import { Colors } from '../../components/DesignSystem'

import { checkAutoContract } from '../../services/tronweb'

class TronWebView extends Component {
  constructor (props) {
    super(props)

    this.webview = null
    this.state = {
      initialized: false,
      url: 'https://tronbet.io',
      isPageVisible: true
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

      if (contract.txID) {
        console.log(contract, '<<< contract')
        this._callContract({
          tx: contract,
          site: this.state.url,
          address: contract.raw_data.contract[0].parameter.value.contract_address,
          amount: contract.raw_data.contract[0].parameter.value.call_value
        })
      }
      this._callContract(contract)
    } catch (e) {
      Alert.alert(e.message)
    }
  }

  _callContract = (contract) => {
    checkAutoContract(contract)
    this.props.navigation.navigate('ContractPreview', { ...contract, prevRoute: 'TronWebview' })
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

  injectTronWeb = (address) => (`
    try {
      const tweb = document.createElement('script');
      tweb.setAttribute('src', 'https://unpkg.com/tronweb@2.1.17/dist/TronWeb.js');
      document.head.appendChild(tweb);
  
      setTimeout(function() {
        const TronWeb = window.TronWeb;
        const HttpProvider = TronWeb.providers.HttpProvider
        const fullNode = new HttpProvider('https://api.trongrid.io') // Full node http endpoint
        const solidityNode = new HttpProvider('https://api.trongrid.io') // Solidity node http endpoint
        const eventServer = 'https://api.trongrid.io' // Contract events http endpoint
  
        const tronWeb = new TronWeb(
          fullNode,
          solidityNode,
          eventServer
        )

        window.tronWeb = tronWeb;
        window.tronWeb.setAddress("${address}");
        window.tronWeb.ready = true;

        window.tronWeb.trx.sign = (transaction) => (
          window.callTronWallet(transaction)
        );
      }, 1000)
    } catch(e) {
      alert(e)
    }
    
  `)

  injectjs () {
    const { accounts } = this.props.context
    const { address } = accounts.find(acc => acc.alias === '@main_account')

    let jsCode = `
        var script   = document.createElement("script");
        script.type  = "text/javascript";
        script.text  = "function callTronWallet(data) {postMessage(JSON.stringify(data))}"
        document.body.appendChild(script);
        document.useragent = "TronWallet1.3"

        ${this.injectTronWeb(address)}
    `

    return jsCode
  }

  render () {
    const { isPageVisible, url } = this.state

    return (
      <PageWrapper>
        <HeaderContainer>
          <HeaderView>
            <FloatingIconButton
              iconName='close'
              iconSize={16}
              iconColor={Colors.primaryText}
              onPress={() => this.props.navigation.goBack()}
              zIndex={10}
            />
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
