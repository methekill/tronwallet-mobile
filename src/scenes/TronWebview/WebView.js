import React, { Component } from 'react'
import { WebView, Alert, StyleSheet, Dimensions, BackHandler } from 'react-native'
import { SafeAreaView } from 'react-navigation'
import Modal from 'react-native-modal'
import MixPanel from 'react-native-mixpanel'
import { Answers } from 'react-native-fabric'

import { WebViewHeader, WebViewFooter, CardContainer } from './elements'
import Loading from './../../components/LoadingScene'
import ContractCard from '../ContractPreview/ContractCard'

import { Colors } from './../../components/DesignSystem'
import { checkAutoContract } from '../../services/tronweb'
import { updateSearchHistory, saveBookmark, isBookmark, removeBookmark } from './../../utils/dappUtils'
import tl from './../../utils/i18n'

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
    url: '',
    isBookmark: false
  }

  componentDidMount () {
    BackHandler.addEventListener('hardwareBackPress', this._goBack)
  }
  componentWillUnmount () {
    BackHandler.removeEventListener('hardwareBackPress', this._goBack)
  }

  open = (url) => {
    this.setState({ url, isPageVisible: true, title: url }, () => {
      MixPanel.trackWithProperties('Open Dapp', { url })
    })
  }

  _onClose = (cb) => {
    this.setState({ isPageVisible: false }, cb)
    if (this.props.onClose) {
      this.props.onClose()
    }
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

      this.setState({
        initialized: true
      })

      isBookmark(this.state.url)
        .then(result => {
          this.setState({ isBookmark: result })
        })
    }
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
        throw new Error(tl.t('contract.error.invalidContract'))
      }

      if (balance < contract.amount) {
        throw new Error(tl.t('contract.error.noAmount'))
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
      if (e instanceof SyntaxError) {
        // console.warn(`[${e.name}]: ${e.message}`)
        Alert.alert(tl.t('message'), tl.t('error.default'))
        Answers.logContentView('Browser Dapps', e.message)
      } else {
        Alert.alert(tl.t('message'), e.message)
      }
    }
  }

  _closeCardDialog = () => {
    this.setState({ isCardVisible: false, contract: {}, url: '', title: '' })
  }

  _checkBookmark = () => {
    const { isBookmark, url, title } = this.state
    if (!isBookmark) {
      saveBookmark({ url, title })
    } else {
      removeBookmark(url)
    }

    this.setState({ isBookmark: !isBookmark })
  }

  _goBack = () => {
    const { canGoBack } = this.state
    if (!canGoBack) {
      return this._onClose()
    }

    this.webview.goBack()
  }

  _goForward = () => {
    if (this.webview) {
      this.webview.goForward()
    }
  }

  _onNavigationStateChange = (navState) => {
    this.setState({
      canGoBack: navState.canGoBack,
      canGoForward: navState.canGoForward,
      title: navState.title
    })

    if (navState.title !== '') {
      updateSearchHistory({
        url: this.state.url,
        title: navState.title
      })
    }
  }

  _onLoadingError = (event) => {
    console.error('encountered an error loading page', event.nativeEvent)
  }

  render () {
    const { isPageVisible, url, title, isCardVisible, contract, canGoForward, isBookmark, initialized } = this.state

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
            onLoadingError={this._onLoadingError}
            source={{ uri: url }}
            nativeConfig={{ props: { webContentsDebuggingEnabled: true } }}
            javaScriptEnabled
            automaticallyAdjustContentInsets
            renderLoading={() => <Loading />}
            startInLoadingState
          />
          <WebViewFooter
            disabled={!initialized}
            onGobackPress={this._goBack}
            onGoForwardPress={canGoForward ? this._goForward : null}
            onMenuPress={() => this._onClose()}
            onSearchPress={() => {
              this._onClose(() => {
                this.props.onRequestSearch()
              })
            }}
            onBookMarkPress={() => this._checkBookmark()}
            isBookmark={isBookmark}
          />
        </SafeAreaView>
        <Modal
          animationIn='fadeIn'
          animationOut='fadeOut'
          isVisible={isCardVisible}
          deviceWidth={deviceSize.width}
          deviceHeight={deviceSize.height}
          style={styles.modal}
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
  },
  webview: {
    width: '100%',
    backgroundColor: Colors.background
  },
  modal: {
    padding: 0,
    flex: 1,
    margin: 0
  }
})

export default WebViewWrapper
