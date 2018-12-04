import RealmStore from '../basic.repository'
import RealmMock from '../__mocks__/realm-data.mock'

describe('Basic repository', () => {
  let store, db

  beforeAll(() => {
    db = new RealmMock('key', [
      { key: 1, value: 'a' },
      { key: 2, value: 'b' }
    ])

    store = new RealmStore(db, '')
  })

  test('should find object when key exist', () => {
    const key = 1
    const object = store.findByKey(key)

    expect(object).toMatchObject({ key: 1, value: 'a' })
  })

  test('should be undefined object when key doesn\'t exist', () => {
    const key = 3
    const object = store.findByKey(key)

    expect(object).toBeUndefined()
  })

  test('should return all objects when has data on list', () => {
    const objects = store.findAll()
    expect(objects).toHaveLength(2)
  })

  test('should return empty list when hasn\'t data on list', () => {
    const db = new RealmMock('key', [])
    const repo = new RealmStore(db, '')

    const objects = repo.findAll()
    expect(objects).toHaveLength(0)
  })

  test('should find object when filter matched', () => {
    db.setFiltered((v) => v.value === 'b')

    const objects = store.findBy('filter')
    expect(objects).toMatchObject([{ key: 2, value: 'b' }])
  })

  test('should return empty list when filter doesn\'t matched', () => {
    db.setFiltered((v) => v.value === 'c')

    const objects = store.findBy('filter')
    expect(objects.length).toBe(0)
  })

  test('should return ordered list when filter doesn\'t matched', () => {
    db.setSorted((v1, v2) => v2.key - v1.key)

    const objects = store.sort('sort')

    const expected = [
      { key: 2, value: 'b' },
      { key: 1, value: 'a' }
    ]

    expect(JSON.stringify(objects)).toEqual(JSON.stringify(expected))
  })

  test('should increase list length when new object is added', () => {
    store.save({ key: 3, value: 'c' })

    const objects = store.findAll()
    expect(objects).toHaveLength(3)
  })

  test('should update object when value from object is updated', () => {
    store.save({ key: 1, value: 'h' })

    const object = store.findByKey(1)
    expect(object).toMatchObject({ key: 1, value: 'h' })
  })

  test('should increase list length when new object is added by write action', () => {
    store.write(() => {
      store.save({ key: 3, value: 'c' })
    })

    const objects = store.findAll()
    expect(objects).toHaveLength(3)
  })

  test('should update object when value from object is updated by write action', () => {
    store.write(() => {
      store.save({ key: 1, value: 'h' })
    })

    const object = store.findByKey(1)
    expect(object).toMatchObject({ key: 1, value: 'h' })
  })
})
