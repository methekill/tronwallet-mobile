import React, { Component } from 'react';
import { WebView, Linking } from 'react-native';

export default class TronWebView extends Component {

  injectjs(){

    let jsCode = `
      function importScript(src) {
        return new Promise((resolve, reject) => {
          const script = document.createElement("script");

          script.async = 1;
          script.type = "text/javascript";
          script.src = src;
          script.onerror = reject;
          script.onload = () => {
            document.body.removeChild(script);
            resolve();
          };

          document.body.appendChild(script);
        });
      }

      if (useragent === 'TronWallet1.3') {
        importScript('https://cdnjs.cloudflare.com/ajax/libs/jquery/3.3.1/jquery.min.js')
        $(".tx").text("Initialized")
      }
    `;
    return jsCode;
  }

  

  render() {
    return <WebView 
    javaScriptEnabled={true}
    injectedJavaScript={this.injectjs()} 
    source={{uri:"https://codepen.io/marlonbrgomes/full/JegmYg"}} style={{ marginTop: 20 }} />;
  }
}