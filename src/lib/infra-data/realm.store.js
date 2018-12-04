let _db

class RealmStore {
  constructor (db, schema) {
    _db = db
    this.schema = schema
  }

  findByKey (key) {
    return _db.objectForPrimaryKey(this.schema, key)
  }

  findAll () {
    return _db.objects(this.schema).map(item => Object.assign({}, item))
  }

  findBy (filter) {
    return _db.objects(this.schema).filtered(filter)
  }

  sort (sortCriteria) {
    return _db.objects(this.schema).sorted(sortCriteria)
  }

  write (callbackFn) {
    return _db.write(callbackFn)
  }

  save (object) {
    this.write(() => {
      _db.create(this.schema, object, true)
    })
  }

  get db () {
    return _db
  }
}

export default RealmStore
