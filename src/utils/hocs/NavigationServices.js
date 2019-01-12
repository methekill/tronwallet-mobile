import { NavigationActions, StackActions } from 'react-navigation'

let _navigator = null
const NOTIFICATIONS_TYPE = ['signals', 'transactions']
let _notifications = {
  type: null, // types 'signals' | 'transactions'
  data: {}
}

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

function setNotification (data = {}) {
  const { type } = data
  if (NOTIFICATIONS_TYPE.indexOf(type) === -1) {
    return null
  }
  _notifications = data
  return _notifications
}

function getNotificationType () {
  return _notifications.type
}

function getNotificationData () {
  return _notifications.data
}

function hasNotification () {
  return getNotificationType() !== null
}

function checkNotifications () {
  const type = getNotificationType()
  const params = getNotificationData()
  switch (type) {
    case 'signals':
      return navigate('Signals', params)
    case 'transactions':
      return navigate('Notifications', params)
    default:
      break
  }
  _notifications = {
    type: null,
    data: {}
  }
}

function goToMainScreen () {
  const resetAction = StackActions.reset({
    index: 0,
    actions: [ NavigationActions.navigate({ routeName: 'App' }) ],
    key: null
  })
  _navigator.dispatch(resetAction)
}

export default {
  navigate,
  setTopLevelNavigator,
  goToMainScreen,
  setNotification,
  hasNotification,
  checkNotifications
}
