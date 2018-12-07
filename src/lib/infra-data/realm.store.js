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
    return _db.objects(this.schema)
  }

  findBy (filter) {
    return _db.objects(this.schema).filtered(filter)
  }

  sort (sortCriteria) {
    return _db.objects(this.schema).sorted(sortCriteria)
  }

  async write (callbackFn) {
    await _db.write(callbackFn)
  }

  async save (object) {
    await this.write(() => {
      _db.create(this.schema, object, true)
    })
  }

  async deleteByKey (key) {
    const object = this.findByKey(key)
    if (object) {
      await this.delete(object)
    }
  }

  async delete (object) {
    await this.write(() => {
      _db.delete(this.schema, object)
    })
  }

  async resetData () {
    const allObjects = this.findAll()
    await this.delete(allObjects)
  }

  get db () {
    return _db
  }
}

export default RealmStore
