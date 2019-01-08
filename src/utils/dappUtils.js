// import { AsyncStorage } from 'react-native'
import * as Async from './asyncStorageUtils'
import { AsyncStorage } from 'react-native'

import { DAPPS_SEARCH_HISTORY } from './constants'

// AsyncStorage.removeItem(DAPPS_SEARCH_HISTORY)

export function saveSearchHistory (data) {
  return getSearchHistory()
    .then(result => {
      if (result.some(item => item.url === data.url)) {
        return null
      }
      result.push(data)
      Async.set(DAPPS_SEARCH_HISTORY, JSON.stringify(result))
      return result
    })
}

export function getSearchHistory () {
  return Async.get(DAPPS_SEARCH_HISTORY, '[]').then(data => JSON.parse(data))
}

export function updateSearchHistory (item) {
  return getSearchHistory()
    .then(result => {
      if (result.length === 0) return null

      const itemIndex = result.findIndex(data => data.url === item.url)
      if (itemIndex > -1) {
        result[itemIndex].title = item.title
        Async.set(DAPPS_SEARCH_HISTORY, JSON.stringify(result))
      }
      return result
    })
}

export const addToList = async (name, data) => {
  const list = JSON.parse(await AsyncStorage.getItem(name))

  list.data.push(data)
  list.data.reverse()
  list.data = list.data.slice(0, list.limit)
  list.data.reverse()

  return AsyncStorage.setItem(name, JSON.stringify(list))
}

export const readList = async (listName) => {
  return JSON.parse(await AsyncStorage.getItem(listName)).data
}

export const createList = ({ name, limit }) => {
  return AsyncStorage.setItem(name, JSON.stringify({ limit, data: [] }))
}

export const deleteList = async (listName) => {
  return AsyncStorage.removeItem(listName)
}
