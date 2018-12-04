import { NavigationActions } from 'react-navigation'

let _navigator = null

function setTopLevelNavigator (navigatorRef) {
  _navigator = navigatorRef
}

function navigate (routeName, params) {
  _navigator.dispatch(
    NavigationActions.navigate({
      routeName,
      params
    })
  )
}

function gotToSignals (params) {
  navigate('Signals', params)
}

function gotToNotifications (params) {
  navigate('Notifications', params)
}

export default {
  navigate,
  setTopLevelNavigator,
  gotToSignals,
  gotToNotifications
}
