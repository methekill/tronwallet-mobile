import Async from './../asyncStorageUtils'

jest.mock('AsyncStorage', () => {
  let items = {
    key2: 'element2'
  }

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

describe('AsyncStorage Utils', () => {
  const key = 'key1'
  const data = 'element1'
  describe('#set', async () => {
    test('should set the value', async () => {
      await Async.set(key, data)
      const currentData = await Async.get(key)
      expect(currentData).toBe(data)
    })
  })

  describe('#get', async () => {
    test('should return the value', async () => {
      const currentData = await Async.get('key2')
      expect(currentData).toBe('element2')
    })
  })
})
