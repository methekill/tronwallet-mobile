// import { AsyncStorage } from 'react-native'
import * as Async from './asyncStorageUtils'
import { DAPPS_SEARCH_HISTORY } from './constants'

// AsyncStorage.removeItem(DAPPS_SEARCH_HISTORY)

export function saveSearchHistory (value) {
  Async.get(DAPPS_SEARCH_HISTORY, '[]')
    .then(result => {
      const currentHistory = JSON.parse(result)
      currentHistory.push(value)
      Async.set(DAPPS_SEARCH_HISTORY, JSON.stringify(currentHistory))
    })
}

export function getSearchHistory () {
  return Async.get(DAPPS_SEARCH_HISTORY, '[]').then(data => JSON.parse(data))
}
