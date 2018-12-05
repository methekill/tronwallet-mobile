class SecretsStore {
  constructor (store) {
    this._store = store
  }

  createMnemonic () {}

  validateMnemonic () {}

  validatePin () {}

  signTransaction () {}

  findAllAccounts () {
    return this._store.findAll()
  }

  findVisibleAccounts () {
    return this.findAllAccounts().filter(account => !account.hide)
  }

  get publicKey () {
    const account = this.findAllAccounts()[0]
    return (account || {}).address
  }
}

export default SecretsStore
