// import { AsyncStorage } from 'react-native'
import * as Async from './asyncStorageUtils'
import { AsyncStorage } from 'react-native'

import { DAPPS_SEARCH_HISTORY, DAPPS_BOOKMARK } from './constants'

// AsyncStorage.removeItem(DAPPS_BOOKMARK)

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

export function saveBookmark (item) {
  return Async.get(DAPPS_BOOKMARK, '[]')
    .then(data => JSON.parse(data))
    .then(async (result) => {
      console.warn(result, item)
      if (result.length === 0) {
        await createList({ name: DAPPS_BOOKMARK, limit: 50 })
      }

      addToList(DAPPS_BOOKMARK, item)
    })
}

export async function isBookmark (url) {
  const bookmark = await AsyncStorage.getItem(DAPPS_BOOKMARK).then(data => JSON.parse(data))
  return bookmark.data.some(mark => mark.url === url)
}

export function getBookmark () {
  return Async.get(DAPPS_BOOKMARK, '[]')
    .then(data => JSON.parse(data))
}

export function removeBookmark (url) {
  return getBookmark()
    .then(result => {
      const newBookmark = {
        ...result,
        data: result.data.filter(item => item.url !== url)
      }
      AsyncStorage.setItem(DAPPS_BOOKMARK, JSON.stringify(newBookmark))
      return newBookmark
    })
}
