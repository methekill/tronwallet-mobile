import { Platform } from 'react-native'
export const replaceRoute = (navigation, routeTo, params) => {
  const transationTime = Platform.OS === 'android' ? 550 : 850
  navigation.goBack(null)
  setTimeout(() => navigation.navigate(routeTo, params), transationTime)
}
