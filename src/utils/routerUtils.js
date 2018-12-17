import { StackActions, NavigationActions } from 'react-navigation'

export const redirectToApp = (navigation) => {
  const resetAction = StackActions.reset({
    index: 0,
    actions: [NavigationActions.navigate({ routeName: 'App' })],
    key: null
  })
  navigation.dispatch(resetAction)
}
