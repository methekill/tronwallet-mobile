import React, { Component } from 'react'

import withContext from '../../utils/hocs/withContext'

import { PageWrapper } from './elements'

import Header from './../../components/Navigation/Header'
import * as Utils from './../../components/Utils'
import tl from './../../utils/i18n'

import { getDApps } from './../../services/contentful/general'

import WebViewHome from './WebViewHome'
import SearchDapps from './SearchDapps'
import WebView from './WebView'

class TronWebView extends Component {
  state = {
    dapps: []
  }

  async componentDidMount () {
    this.setState({ dapps: await getDApps() })
  }

  _onSearch = (url) => {
    this._webView.open(url)
  }

  render () {
    const { dapps } = this.state
    return (
      <Utils.SafeAreaView>
        <PageWrapper>
          <Header
            title={tl.t('dapps.title')}
            onBack={() => this.props.navigation.goBack()}
          />
          <WebViewHome onPress={url => this._webView.open(url)} dapps={dapps} />
          <WebView
            ref={ref => (this._webView = ref)}
            accounts={this.props.context.accounts}
            onRequestSearch={() => this._search.open()}
          />
        </PageWrapper>
        <SearchDapps ref={ref => (this._search = ref)} onSearch={this._onSearch} />
      </Utils.SafeAreaView>
    )
  }
}

export default withContext(TronWebView)
