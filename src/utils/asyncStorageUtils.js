import { AsyncStorage } from 'react-native'

export function get (key, defaultReturnValue = null) {
  return AsyncStorage.getItem(key).then(data => data || defaultReturnValue)
}

export function set (key, data = null) {
  try {
    return AsyncStorage.setItem(key, data)
  } catch (error) {
    return null
  }
}

export function json (key, defaultReturnValue = null) {
  return get(key, defaultReturnValue).then(result => JSON.parse(result))
}

export function setJSON (key, data = null) {
  return set(key, JSON.stringify(data))
}

export default {
  get,
  set,
  json,
  setJSON
}
