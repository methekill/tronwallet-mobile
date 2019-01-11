import {
  getSearchHistory, saveSearchHistory, updateSearchHistory,
  getBookmarks, saveBookmark, isBookmark, removeBookmark,
  getHomeHistory, saveHomeHistory, removeHomeHistory
} from './../dappUtils'

jest.mock('AsyncStorage', () => {
  let items = { }

  return {
    setItem: jest.fn((item, value) => {
      items[item] = value
      return Promise.resolve(value)
    }),
    multiSet: jest.fn((item, value) => {
      item.forEach(([key, value]) => {
        items[key] = value
      })
      return Promise.resolve(value)
    }),
    getItem: jest.fn((item, value) => {
      return Promise.resolve(items[item])
    })
  }
})

describe('DApps', () => {
  test('#getSearchHistory', async () => {
    const expectValue = { limit: 50, data: [] }
    const result = await getSearchHistory()
    expect(result).toMatchObject(expectValue)
  })

  test('#saveSearchHistory', () => {
    const item = { title: 'Google', url: 'google.com' }
    const expectValue = { limit: 50, data: [item] }
    saveSearchHistory(item)
      .then(async () => {
        const result = await getSearchHistory()
        expect(result).toMatchObject(expectValue)
      })
  })

  test('#updateSearchHistory', () => {
    const item = { title: '', url: 'google.com' }
    const expectItem = { title: 'Google', url: 'google.com' }
    saveSearchHistory(item)
      .then(() => {
        updateSearchHistory(expectItem)
          .then(async () => {
            const result = await getSearchHistory().data.filter(itemData => itemData.url === item.url)[0]
            expect(result).toMatchObject(expectItem)
          })
      })
  })

  test('#getBookmarks', () => {
    getBookmarks()
      .then(result => {
        expect(result).toMatchObject({ limit: 50, data: [] })
      })
  })

  test('#saveBookmark', () => {
    const item = { title: 'Google', url: 'google.com' }
    saveBookmark(item)
      .then(() => {
        getBookmarks()
          .then(bookmarks => {
            const result = bookmarks.data.find(i => i.url === item.url)
            expect(result).toMatchObject(item)
          })
      })
  })

  test('#isBookmark', () => {
    const item = { title: 'Google', url: 'google.com' }
    saveBookmark(item)
      .then(async () => {
        expect(isBookmark(item.url)).toBeTruthy()
      })
  })

  test('#removeBookmark', async () => {
    const item = { title: 'Google', url: 'google.com' }
    await saveBookmark(item)
    const resultBeforeRemove = await getBookmarks()
    expect(resultBeforeRemove).toMatchObject({ limit: 50, data: [item] })
    await removeBookmark(item.url)
    const resultAfterRemove = await getBookmarks()
    expect(resultAfterRemove).toMatchObject({ limit: 50, data: [] })
  })

  test('#getHomeHistory', () => {
    getHomeHistory()
      .then(result => {
        expect(result).toMatchObject({ limit: 50, data: [] })
      })
  })
  test('#saveHomeHistory', async () => {
    const item = { title: 'Google', url: 'google.com' }
    await saveHomeHistory(item)
    const bookmarks = await getHomeHistory()
    const result = bookmarks.data.find(i => i.url === item.url)
    expect(result).toMatchObject(item)
  })

  test('#removeHomeHistory', async () => {
    const item = { title: 'Google', url: 'google.com' }
    await saveHomeHistory(item)
    const resultBeforeRemove = await getHomeHistory()
    expect(resultBeforeRemove).toMatchObject({ limit: 50, data: [item] })
    await removeHomeHistory(item.url)
    const resultAfterRemove = await getHomeHistory()
    expect(resultAfterRemove).toMatchObject({ limit: 50, data: [] })
  })
})
