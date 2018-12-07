class RealmMock {
  constructor (key, data) {
    this._key = key
    this.data = data
  }

  objectForPrimaryKey (schema, key) {
    return this.data.find((d) => d[this._key] === key)
  }

  objects (schema) {
    return this.data
  }

  setFiltered (filtered) {
    this.data.filtered = () => this.data.filter(filtered)
  }

  setSorted (sorted) {
    this.data.sorted = () => this.data.sort(sorted)
  }

  write (callbackFn) {
    callbackFn()
  }

  create (schema, object, update) {
    if (!update) {
      this.data.push(object)
      return
    }

    const value = this.objectForPrimaryKey(schema, object[this._key])

    if (value) {
      Object.keys(value).forEach((k) => {
        if (object[k]) value[k] = object[k]
      })
    } else {
      this.data.push(object)
    }
  }

  delete (schema, object) {
    const list = Array.isArray(object) ? object : [object]
    list.forEach((item) => {
      const arr = this.data
      arr.splice(arr.indexOf(item), 1)
    })
  }
}

export default RealmMock
