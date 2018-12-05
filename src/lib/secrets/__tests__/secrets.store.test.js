import RealmStoreMock from '../../infra-data/__mocks__/realm.store.mock'
import SecretsStore from '../secrets.store'

describe('Secret store', () => {
  let secretStore, store, mockData

  beforeEach(() => {
    mockData = [
      { key: 1, value: 'a', hide: false },
      { key: 2, value: 'b', hide: true }
    ]

    store = new RealmStoreMock('key', mockData)

    secretStore = new SecretsStore(store)
  })

  test('should return all accounts when accounts list exist', () => {
    const accounts = secretStore.findAllAccounts()

    expect(accounts).toMatchObject(mockData)
  })

  test('should return empty list when accounts list is empty', () => {
    const store = new RealmStoreMock('key', [])
    const secretStore = new SecretsStore(store)

    const accounts = secretStore.findAllAccounts()

    expect(accounts).toHaveLength(0)
  })

  test('should return only visible accounts when list have visible accounts', () => {
    const accounts = secretStore.findVisibleAccounts()

    expect(accounts).toMatchObject([{ key: 1, value: 'a', hide: false }])
  })

  test('should return empty list when list doesn\'t have visible accounts', () => {
    const store = new RealmStoreMock('key', [{ key: 1, value: 'a', hide: true }])
    const secretStore = new SecretsStore(store)

    const accounts = secretStore.findVisibleAccounts()

    expect(accounts).toHaveLength(0)
  })
})
