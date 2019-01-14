import React from 'react'
import { Dimensions, Clipboard, StyleSheet } from 'react-native'
import { TabViewAnimated, TabBar } from 'react-native-tab-view'
import Toast from 'react-native-easy-toast'
import MixPanel from 'react-native-mixpanel'

import * as Utils from '../../components/Utils'
import { Colors } from '../../components/DesignSystem'
import NavigationHeader from '../../components/Navigation/Header'

import FontelloIcon from '../../components/FontelloIcon'
import { SecretCard, Secret } from './elements'

import tl from '../../utils/i18n'
import { withContext } from '../../store/context'

const initialLayout = {height: 0, width: Dimensions.get('window').width}
const TAB_WIDTH = Dimensions.get('window').width / 2
const INDICATOR_WIDTH = 15

class Save extends React.Component {
  static navigationOptions = { header: null }

  state = {
    index: 0,
    routes: [
      { key: 'seed', title: 'Seed' },
      { key: 'privatekey', title: 'Private Key' }
    ]
  }

  _handleIndexChange = index => this.setState({ index })

  _renderHeader = props => (
    <TabBar
      {...props}
      indicatorStyle={styles.indicatorStyle}
      tabStyle={styles.tabBarStyle}
      labelStyle={styles.labelStyle}
      style={styles.tabBarStyle}
    />
  )

  _onCopyClipboard = (eventName, string) => async () => {
    await Clipboard.setString(string)
    const typeOfEvent = eventName === 'seed' ? 'publicKey' : 'privateKey'
    MixPanel.trackWithProperties('Copy to clipboard', {
      type: typeOfEvent,
      location: 'Backup Wallet'
    })
    this.refs.toast.show(tl.t('receive.clipboardCopied'))
    setTimeout(() => Clipboard.setString(''), 30000)
  }

  _getAccountIfo = () => {
    const { userSecrets, publicKey } = this.props.context
    const accountIndex = userSecrets.findIndex(s => s.address === publicKey)
    if (accountIndex > -1) {
      return userSecrets[accountIndex]
    }

    return { privatekey: 'Not available', mnemonic: 'Not available' }
  }

  _renderSecret = (eventName, secret) => (
    <Utils.View align='center'>
      <SecretCard>
        <Utils.View align='flex-end' justify='center' height={30} padding={0} >
          <Utils.Button width={28} height={28} justify='center' onPress={this._onCopyClipboard(eventName, secret)} >
            <FontelloIcon name='copy' size={14} color={Colors.secondaryText} />
          </Utils.Button>
        </Utils.View>
        <Secret secret={secret} />
      </SecretCard>
    </Utils.View>
  )

  _renderScene = ({ route }) => {
    const currentAccount = this._getAccountIfo()
    switch (route.key) {
      case 'seed':
        return this._renderSecret('seed', currentAccount.mnemonic)
      case 'privatekey':
        return this._renderSecret('privatekey', currentAccount.privateKey)
      default: return null
    }
  }

  render () {
    const { navigation } = this.props
    return (
      <Utils.SafeAreaView>
        <NavigationHeader
          title={tl.t('settings.backup.title')}
          onBack={() => navigation.goBack()}
        />
        <Utils.Container>
          <TabViewAnimated
            navigationState={this.state}
            renderScene={this._renderScene}
            renderHeader={this._renderHeader}
            onIndexChange={this._handleIndexChange}
            initialLayout={initialLayout}
          />
          <Toast
            ref='toast'
            position='center'
            fadeInDuration={750}
            fadeOutDuration={1000}
            opacity={0.8}
          />
        </Utils.Container>
      </Utils.SafeAreaView>
    )
  }
}

const styles = StyleSheet.create({
  indicatorStyle: {
    width: INDICATOR_WIDTH,
    height: 1,
    marginLeft: (TAB_WIDTH / 2 - INDICATOR_WIDTH / 2)
  },
  tabStyle: {
    padding: 8
  },
  labelStyle: {
    fontSize: 12,
    lineHeight: 12,
    letterSpacing: 0.6,
    fontFamily: 'Rubik-Medium'
  },
  tabBarStyle: {
    backgroundColor: Colors.background,
    elevation: 0,
    shadowOpacity: 0
  }
})

export default withContext(Save)
