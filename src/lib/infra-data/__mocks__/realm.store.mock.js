import RealmMock from './realm-data.mock'
import RealmStore from '../realm.store'

class RealmStoreMock {
  constructor (key, data) {
    const db = new RealmMock(key, data)
    this._store = new RealmStore(db, '')
  }

  findByKey (key) {
    return this._store.findByKey(key)
  }

  findAll () {
    return this._store.findAll()
  }

  setFilter (filter) {
    this._store.db.setFiltered(filter)
  }

  setSort (sort) {
    this._store.db.setSorted(sort)
  }

  write (callbackFn) {
    this._store.write(callbackFn)
  }

  save (object) {
    this._store.save(object)
  }

  get db () {
    return this._store.db
  }
}

export default RealmStoreMock
