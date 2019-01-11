// import { AsyncStorage } from 'react-native'
import * as Async from './asyncStorageUtils'
import { AsyncStorage } from 'react-native'

import { DAPPS_SEARCH_HISTORY, DAPPS_BOOKMARK, DAPPS_HOME_HISTORY } from './constants'

// AsyncStorage.removeItem(DAPPS_SEARCH_HISTORY)
// AsyncStorage.removeItem(DAPPS_BOOKMARK)
// AsyncStorage.removeItem(DAPPS_HOME_HISTORY)

const addToList = async (name, data) => {
  const list = await Async.json(name, '{ "limit": 50, "data": [] }')

  list.data.push(data)
  list.data.reverse()
  list.data = list.data.slice(0, list.limit)
  list.data.reverse()
  return Async.setJSON(name, list)
}

const readList = async (listName) => {
  return Async.json(listName, '{ "limit": 50, "data": [] }')
}

const updateItem = async (listName, item) => {
  return readList(listName)
    .then(async (result) => {
      const list = Object.assign(result)
      const itemIndex = list.data.findIndex(data => data.url === item.url)
      if (itemIndex > -1) {
        list.data[itemIndex].title = item.title
        await Async.setJSON(listName, list)
      }
    })
}

export function getSearchHistory () {
  return Async.json(DAPPS_SEARCH_HISTORY, '{ "limit": 50, "data": [] }')
}

export function saveSearchHistory (item) {
  return getSearchHistory()
    .then(async (result) => {
      if (result.data.some(dataItem => dataItem.url === item.url)) {
        return null
      }

      return addToList(DAPPS_SEARCH_HISTORY, item)
    })
}

export function updateSearchHistory (item) {
  return getSearchHistory()
    .then(async (result) => {
      if (result.data.length === 0) return null
      return updateItem(DAPPS_SEARCH_HISTORY, item)
    })
}

export function getBookmarks () {
  return Async.json(DAPPS_BOOKMARK, '{ "limit": 50, "data": [] }')
}

export function saveBookmark (item) {
  return getBookmarks()
    .then((result) => {
      return addToList(DAPPS_BOOKMARK, item)
    })
}

export async function isBookmark (url) {
  const bookmark = await getBookmarks().then(result => result.data)
  return bookmark.some(mark => mark.url === url)
}

export function removeBookmark (url) {
  return getBookmarks()
    .then(async (result) => {
      const newBookmark = {
        ...result,
        data: result.data.filter(item => item.url !== url)
      }
      await AsyncStorage.setItem(DAPPS_BOOKMARK, JSON.stringify(newBookmark))
      return newBookmark
    })
}

export function getHomeHistory () {
  return Async.json(DAPPS_HOME_HISTORY, '{ "limit": 50, "data": [] }')
}

export function saveHomeHistory (item) {
  return getHomeHistory()
    .then(async (result) => {
      if (result.data.some(mark => mark.url === item.url)) {
        return updateItem(DAPPS_HOME_HISTORY, { ...item, update_at: new Date().toISOString() })
      }
      return addToList(DAPPS_HOME_HISTORY, { ...item, update_at: new Date().toISOString() })
    })
}

export function removeHomeHistory (url) {
  return getHomeHistory()
    .then(async (result) => {
      const newData = result.data.filter(item => item.url !== url)
      const newHomeHistory = {
        ...result,
        data: newData
      }
      await Async.setJSON(DAPPS_HOME_HISTORY, newHomeHistory)
      return newHomeHistory
    })
}
