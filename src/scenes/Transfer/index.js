import * as React from 'react'
import { Dimensions, SafeAreaView } from 'react-native'
import { TabViewAnimated, TabBar, SceneMap } from 'react-native-tab-view'
import FreezeScreen from '../Freeze/index'
import { Colors } from '../../components/DesignSystem'
import SendScreen from '../Send/index'
import * as Utils from '../../components/Utils'

const initialLayout = {
  height: 0,
  width: Dimensions.get('window').width
}

export default class TransferScene extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      header: (
        <SafeAreaView>
          <Utils.Header background={Colors.background} noBorder>
            <Utils.TitleWrapper background={Colors.background}>
              <Utils.Title paddingLeft='large'>Transfers</Utils.Title>
            </Utils.TitleWrapper>
          </Utils.Header>
        </SafeAreaView>
      )
    }
  }

  state = {
    index: 0,
    routes: [{ key: 'send', title: 'Send' }, { key: 'freeze', title: 'Freeze' }]
  }

  _handleIndexChange = index => this.setState({ index })

  _renderHeader = props => (
    <TabBar
      {...props}
      labelStyle={{ color: Colors.secondaryText }}
      style={{
        backgroundColor: Colors.background,
        flex: 0.1,
        borderBottomWidth: 1,
        borderColor: Colors.lighterBackground,
        paddingBottom: 10
      }}
    />
  )

  _renderScene = SceneMap({
    send: () => <SendScreen {...this.props} />,
    freeze: () => <FreezeScreen {...this.props} />
  })

  render () {
    return (
      <TabViewAnimated
        navigationState={this.state}
        renderScene={this._renderScene}
        renderHeader={this._renderHeader}
        onIndexChange={this._handleIndexChange}
        initialLayout={initialLayout}
      />
    )
  }
}
