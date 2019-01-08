import React, { Component } from 'react'
import { WebView, Alert, StyleSheet, Dimensions, BackHandler } from 'react-native'
import { SafeAreaView } from 'react-navigation'
import Modal from 'react-native-modal'
import { WebViewHeader, WebViewFooter, CardContainer } from './elements'
// import Loading from './../../components/LoadingScene'
import ContractCard from '../ContractPreview/ContractCard'

import { Colors } from './../../components/DesignSystem'
import { checkAutoContract } from '../../services/tronweb'
import { saveSearchHistory } from './../../utils/dappUtils'

const deviceSize = Dimensions.get('window')

class WebViewWrapper extends Component {
  static displayName = 'Dapps WebView'

  static defaultProps = {
    accounts: []
  }

  state = {
    isPageVisible: false,
    isCardVisible: false,
    contract: {},
    initialized: false,

    canGoBack: false,
    canGoForward: false,
    title: '',
    url: ''
  }

  componentDidMount () {
    BackHandler.addEventListener('hardwareBackPress', this._goBack)
  }
  componentWillUnmount () {
    BackHandler.removeEventListener('hardwareBackPress', this._goBack)
  }

  open = (url) => this.setState({
    url,
    isPageVisible: true,
    title: url
  })

  _onClose = (cb) => {
    this.setState({ isPageVisible: false }, cb)
  }

  _injectDebuggScript = () => `
    document.addEventListener("message", function(data) {
      var JData = JSON.parse(data.data);
      alert(data.data)
    });
  `

  _injectTronWeb = (address) => (`
    try {
      const tweb = document.createElement('script');
      tweb.setAttribute('src', 'https://unpkg.com/tronweb@2.1.17/dist/TronWeb.js');
      document.head.appendChild(tweb);

      console.log = function(msg){postMessage(JSON.stringify({ msg: msg, type: "LOG" }))}
      console.error = function(msg){postMessage(JSON.stringify({ msg: msg, type: "LOG" }))}
  
      const injectWatcher = setInterval(function() {
        if(window.TronWeb) {
          clearInterval(injectWatcher)
          
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

          function injectPromise(func, ...args) {
            return new Promise((resolve, reject) => {
                func(...args, (err, res) => {
                    if(err)
                        reject(err);
                    else resolve(res);
                });
            });
          }

          return window.tronWeb.trx.sign = (transaction, _pk, _useTronHeader, callback) => {
            return new Promise((resolve, reject) => {
              window.callTronWallet(transaction)

              document.addEventListener("message", function(data) {
                var tr = JSON.parse(data.data);
                
                resolve(tr)

                if(callback) {
                  callback(tr);
                }
                
              });
            })
            
          };

          
        }
      }, 10)
    } catch(e) {
      alert(e)
    }    
  `)

  _injectjs () {
    const { accounts } = this.props
    if (accounts.length === 0) return null
    const { address } = accounts.find(acc => acc.alias === '@main_account')

    let jsCode = `
        var script   = document.createElement("script");
        script.type  = "text/javascript";
        script.text  = "function callTronWallet(data) {postMessage(JSON.stringify(data))}"
        document.body.appendChild(script);
        document.useragent = "TronWallet1.3"

        ${this._injectTronWeb(address)}
    `
    return jsCode
  }

  _configInstance = () => {
    const { accounts } = this.props

    if (accounts.length === 0) return null
    const { balance, address, tronPower, confirmed } = accounts.find(acc => acc.alias === '@main_account')

    if (this.webview) {
      this._sendMessage('ADDRESS', {
        balance,
        address,
        tronPower,
        confirmed
      })

      this.setState({ initialized: true })
    }

    saveSearchHistory({
      url: this.state.url,
      title: this.state.title
    })
  }

  _callContract = (contract) => {
    checkAutoContract(contract)
    this.setState({ contract, isCardVisible: true })
  }

  _sendMessage = (type, payload) => {
    this.webview.postMessage(JSON.stringify({
      type,
      payload
    }))
  }

  _handleMessage = (ev) => {
    const { accounts = [] } = this.props

    if (accounts.length === 0) return null

    const { balance, address } = accounts.find(acc => acc.alias === '@main_account')

    try {
      const contract = JSON.parse(ev.nativeEvent.data)

      if (contract.type === 'LOG') {
        return console.log(contract.msg)
      }

      if ((!balance && balance !== 0) || !address) {
        throw new Error('Invalid contract, try again or contact the support for help')
      }

      if (balance < contract.amount) {
        throw new Error('You dont have enought amount to run this contract')
      }

      if (contract.txID) {
        return this._callContract({
          tx: contract,
          site: this.state.url,
          address: contract.raw_data.contract[0].parameter.value.contract_address,
          amount: contract.raw_data.contract[0].parameter.value.call_value,
          cb: (tr) => this.webview.postMessage(JSON.stringify(tr))
        })
      }
    } catch (e) {
      Alert.alert(e.message)
    }
  }

  _closeCardDialog = () => {
    this.setState({ isCardVisible: false, contract: {} })
  }

  _goBack = () => {
    const { canGoBack } = this.state
    if (!canGoBack) {
      return this._onClose()
    }

    this.webview.goBack()
  }

  _goForward = () => {}

  _onNavigationStateChange = (navState) => {
    this.setState({
      canGoBack: navState.canGoBack,
      canGoForward: navState.canGoForward,
      title: navState.title === '' ? this.state.url : navState.title
    })
  }

  render () {
    const { isPageVisible, url, title, isCardVisible, contract, canGoForward } = this.state

    return (
      <Modal
        style={styles.modal}
        isVisible={isPageVisible}
        onBackButtonPress={() => this._onClose()}
        deviceWidth={deviceSize.width}
        deviceHeight={deviceSize.height}
      >
        <SafeAreaView style={styles.container} forceInset={{ top: 'always', bottom: 'always' }}>
          <WebViewHeader title={title} />
          <WebView
            style={styles.webview}
            ref={(ref) => (this.webview = ref)}
            injectedJavaScript={this._injectjs()}
            onMessage={this._handleMessage}
            onLoadEnd={this._configInstance}
            onNavigationStateChange={this._onNavigationStateChange}
            onError={(e) => console.warn(e)}
            source={{ uri: url }}
            nativeConfig={{ props: { webContentsDebuggingEnabled: true } }}
            javaScriptEnabled
            automaticallyAdjustContentInsets
          />
          <WebViewFooter
            onGobackPress={this._goBack}
            onGoForwardPress={canGoForward ? this._goForward : null}
            onMenuPress={() => this._onClose()}
            onSearchPress={() => {
              this._onClose(() => {
                this.props.onRequestSearch()
              })
            }}
          />
        </SafeAreaView>
        <Modal
          animationType='fade'
          presentationStyle='overFullScreen'
          isVisible={isCardVisible}
          transparent
        >
          <CardContainer>
            {isCardVisible ? <ContractCard params={contract} closeDialog={this._closeCardDialog} /> : null}
          </CardContainer>
        </Modal>
      </Modal>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.slateGrey
    // position: 'absolute',
    // top: 0,
    // left: 0,
    // right: 0,
    // bottom: 0
  },
  webview: {
    // flex: 1,
    width: '100%'
    // height: '100%'
  },
  modal: {
    padding: 0,
    flex: 1,
    margin: 0
  }
})

export default WebViewWrapper
