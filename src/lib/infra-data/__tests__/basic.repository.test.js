import BasicRepository from '../basic.repository'
import RealmMock from '../__mocks__/realm-data.mock'

describe('Basic repository', () => {
  let basicRepo, db

  beforeAll(() => {
    db = new RealmMock('key', [
      { key: 1, value: 'a' },
      { key: 2, value: 'b' }
    ])

    basicRepo = new BasicRepository(db, '')
  })

  test('should find object when key exist', () => {
    const key = 1
    const object = basicRepo.findByKey(key)

    expect(object).toMatchObject({ key: 1, value: 'a' })
  })

  test('should be undefined object when key doesn\'t exist', () => {
    const key = 3
    const object = basicRepo.findByKey(key)

    expect(object).toBeUndefined()
  })

  test('should return all objects when has data on list', () => {
    const objects = basicRepo.findAll()
    expect(objects).toHaveLength(2)
  })

  test('should return empty list when hasn\'t data on list', () => {
    const db = new RealmMock('key', [])
    const repo = new BasicRepository(db, '')

    const objects = repo.findAll()
    expect(objects).toHaveLength(0)
  })

  test('should find object when filter matched', () => {
    db.setFiltered((v) => v.value === 'b')

    const objects = basicRepo.findBy('filter')
    expect(objects).toMatchObject([{ key: 2, value: 'b' }])
  })

  test('should return empty list when filter doesn\'t matched', () => {
    db.setFiltered((v) => v.value === 'c')

    const objects = basicRepo.findBy('filter')
    expect(objects.length).toBe(0)
  })

  test('should return ordered list when filter doesn\'t matched', () => {
    db.setSorted((v1, v2) => v2.key - v1.key)

    const objects = basicRepo.sort('sort')

    const expected = [
      { key: 2, value: 'b' },
      { key: 1, value: 'a' }
    ]

    expect(JSON.stringify(objects)).toEqual(JSON.stringify(expected))
  })

  test('should increase list length when new object is added', () => {
    basicRepo.save({ key: 3, value: 'c' })

    const objects = basicRepo.findAll()
    expect(objects).toHaveLength(3)
  })

  test('should update object when value from object is updated', () => {
    basicRepo.save({ key: 1, value: 'h' })

    const object = basicRepo.findByKey(1)
    expect(object).toMatchObject({ key: 1, value: 'h' })
  })

  test('should increase list length when new object is added by write action', () => {
    basicRepo.write(() => {
      basicRepo.save({ key: 3, value: 'c' })
    })

    const objects = basicRepo.findAll()
    expect(objects).toHaveLength(3)
  })

  test('should update object when value from object is updated by write action', () => {
    basicRepo.write(() => {
      basicRepo.save({ key: 1, value: 'h' })
    })

    const object = basicRepo.findByKey(1)
    expect(object).toMatchObject({ key: 1, value: 'h' })
  })
})
