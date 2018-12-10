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
    const arr = this.data

    const indexToRemove = list.map(item => arr.indexOf(item)).sort((a, b) => b - a)
    indexToRemove.forEach((index) => {
      arr.splice(index, 1)
    })
  }
}

export default RealmMock
