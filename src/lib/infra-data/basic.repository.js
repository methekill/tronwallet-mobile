class BasicRepository {
  constructor (db, schema) {
    this.db = db
    this.schema = schema
  }

  findByKey (key) {
    return this.db.objectForPrimaryKey(this.schema, key)
  }

  findAll () {
    return this.db.objects(this.schema).map(item => Object.assign({}, item))
  }

  findBy (filter) {
    return this.db.objects(this.schema).filtered(filter)
  }

  sort (sortCriteria) {
    return this.db.objects(this.schema).sorted(sortCriteria)
  }

  write (callbackFn) {
    return this.db.write(callbackFn)
  }

  save (object) {
    this.write(() => {
      this.db.create(this.schema, object, true)
    })
  }
}

export default BasicRepository
