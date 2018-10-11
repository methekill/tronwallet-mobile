
import { Platform, AppState, DeviceEventEmitter } from 'react-native'

export default (callbackHandler) => Platform.OS === 'android'
  ? DeviceEventEmitter.addListener('ActivityStateChange', (e) => callbackHandler(e.event))
  : AppState.addEventListener('change', callbackHandler)
