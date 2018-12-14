import { Platform } from 'react-native'
export const replaceRoute = (navigation, routeTo, params) => {
  const transitionTime = Platform.OS === 'android' ? 550 : 850
  navigation.goBack(null)
  setTimeout(() => navigation.navigate(routeTo, params), transitionTime)
}

export function getActiveRouteName (navigationState) {
  if (!navigationState) {
    return null
  }
  const route = navigationState.routes[navigationState.index]
  // dive into nested navigators
  if (route.routes) {
    return getActiveRouteName(route)
  }
  return route.routeName
}
