class UserSecretRepositoryMock {
  constructor (data) {
    this._data = data
  }

  findByKey (address) {
    return this._data.find((d) => d.address === address)
  }

  async save (object) {
    const value = this.findByKey(object.address)

    if (value) {
      Object.keys(value).forEach((k) => {
        if (object[k]) value[k] = object[k]
      })
    } else {
      this._data.push(object)
    }
  }
}

export default UserSecretRepositoryMock
