import React from 'react'
import get from 'lodash/get'
import { createMaterialTopTabNavigator, SafeAreaView } from 'react-navigation'
import { Colors, ScreenSize } from './../../components/DesignSystem'
import NavigationHeader from './../../components/Navigation/Header'

const tabWidth = ScreenSize.width / 2
const indicatorWidth = 15
const defaultCardStyle = {
  shadowColor: 'transparent',
  backgroundColor: Colors.background
}

export default function createCustomTopTabNavigator (routeConfigMap, tabConfig = { tabBarOptions: {} }) {
  const NotificationsTabs = createMaterialTopTabNavigator(routeConfigMap, {
    tabBarOptions: {
      activeTintColor: Colors.primaryText,
      inactiveTintColor: '#66688f',
      style: {
        paddingTop: 10,
        backgroundColor: Colors.background,
        elevation: 0
      },
      labelStyle: {
        fontSize: 12,
        lineHeight: 12,
        letterSpacing: 0.6,
        fontFamily: 'Rubik-Medium'
      },
      indicatorStyle: {
        width: indicatorWidth,
        height: 1.2,
        marginLeft: tabWidth / 2 - indicatorWidth / 2
      }
    },
    mode: 'modal',
    cardStyle: defaultCardStyle
  })

  class CustomNavigator extends React.Component {
  static router = NotificationsTabs.router;
  render () {
    const { navigation } = this.props

    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }} forceInset={{ top: 'always', bottom: 'always' }} >
        <NavigationHeader
          title={get(tabConfig, 'tabBarOptions.title', '')}
          onBack={() => navigation.goBack()}
        />
        <NotificationsTabs navigation={navigation} />
      </SafeAreaView>
    )
  }
  }

  return CustomNavigator
}
