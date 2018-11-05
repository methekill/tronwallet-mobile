import React from 'react'
import { Dimensions, Clipboard } from 'react-native'
import { TabViewAnimated, TabBar } from 'react-native-tab-view'
import Toast from 'react-native-easy-toast'

import * as Utils from '../../components/Utils'
import { Colors } from '../../components/DesignSystem'
import NavigationHeader from '../../components/Navigation/Header'
import FontelloButton from '../../components/FontelloButton'
import { SecretCard, Secret } from './elements'

import tl from '../../utils/i18n'
import { withContext } from '../../store/context'

const initialLayout = {height: 0, width: Dimensions.get('window').width}
const TAB_WIDTH = Dimensions.get('window').width / 2
const INDICATOR_WIDTH = 13

class Save extends React.Component {
  static navigationOptions = () => ({ header: null })

  state = {
    seed: null,
    privateKey: null,
    index: 0,
    routes: [
      { key: 'seed', title: 'Seed' },
      { key: 'privatekey', title: 'Private Key' }
    ]
  }

  componentDidMount () {
    const { userSecrets, publicKey } = this.props.context
    const currentAccount = userSecrets.find(s => s.address === publicKey) || { privatekey: 'Not available', seed: 'Not available' }
    this.setState({seed: currentAccount.mnemonic, privateKey: currentAccount.privateKey})
  }

  _handleIndexChange = index => this.setState({ index })

  _renderHeader = props => (
    <TabBar
      {...props}
      indicatorStyle={{
        width: INDICATOR_WIDTH,
        height: 1,
        marginLeft: (TAB_WIDTH / 2 - INDICATOR_WIDTH / 2)
      }}
      tabStyle={{
        padding: 8
      }}
      labelStyle={{
        fontFamily: 'Rubik-Medium',
        fontSize: 12,
        letterSpacing: 0.65,
        lineHeight: 12
      }}
      style={{
        backgroundColor: Colors.background,
        elevation: 0,
        shadowOpacity: 0
      }}
    />
  )

  _onCopyClipboard = async string => {
    await Clipboard.setString(string)
    this.refs.toast.show(tl.t('receive.clipboardCopied'))
  }

  _renderSecret = secret =>
    <Utils.View align='center'>
      <SecretCard>
        <FontelloButton
          size={16}
          style={{alignItems: 'flex-end'}}
          name='copy'
          color={Colors.secondaryText}
          onPress={() => this._onCopyClipboard(secret)}
        />
        <Secret secret={secret} />
      </SecretCard>
    </Utils.View>

  _renderScene = ({ route }) => {
    switch (route.key) {
      case 'seed': return this._renderSecret(this.state.seed)
      case 'privatekey': return this._renderSecret(this.state.privateKey)
      default: return null
    }
  }

  render () {
    const { navigation } = this.props
    return (
      <Utils.SafeAreaView>

        <Utils.Container>
          <NavigationHeader
            title={tl.t('settings.backup.title')}
            onBack={() => navigation.goBack()}
          />
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

export default withContext(Save)
