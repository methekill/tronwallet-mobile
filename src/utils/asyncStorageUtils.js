import { AsyncStorage } from 'react-native'

export function get (key, defaultReturnValue = null) {
  try {
    return AsyncStorage.getItem(key)
      .then(data => {
        return data || defaultReturnValue
      })
  } catch (error) {
    return defaultReturnValue
  }
}

export function set (key, data = null) {
  try {
    return AsyncStorage.setItem(key, data)
  } catch (error) {
    return null
  }
}

export default {
  get,
  set
}
