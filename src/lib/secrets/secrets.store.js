class SecretsStore {
  constructor (store, tron) {
    this._store = store
    this._tron = tron
  }

  createMnemonic () {}

  validateMnemonic () {}

  validatePin () {}

  signTransaction () {}

  async create (accountName, mnemonic) {
    if (!accountName || !mnemonic) {
      return null
    }

    const accounts = this.findAllAccounts()

    const userSecret = await this._tron.generateKeypair(mnemonic, accounts.length, false)

    userSecret.mnemonic = mnemonic
    userSecret.name = accountName
    userSecret.alias = this.formatAlias(accountName)
    userSecret.confirmed = true
    userSecret.hide = false

    this._store.save(userSecret)

    return userSecret
  }

  async createFirstAccount (mnemonic) {
    const accounts = this.findAllAccounts()
    if (accounts.length) {
      return null
    }

    return this.create('Main account', mnemonic)
  }

  async createByExistentAccount (accountName) {
    const firstAccount = this.findFirstAccount()
    if (!firstAccount) {
      return null
    }

    return this.create(accountName, firstAccount.mnemonic)
  }

  formatAlias (name) {
    return name && `@${name.trim().toLowerCase().replace(/ /g, '_')}`
  }

  findAllAccounts () {
    return this._store.findAll() || []
  }

  findFirstAccount () {
    const accounts = this.findAllAccounts()
    return accounts[0]
  }

  findLastAccount () {
    const accounts = this.findAllAccounts()
    return accounts[accounts.length - 1]
  }

  findVisibleAccounts () {
    return this.findAllAccounts().filter(account => !account.hide)
  }

  get publicKey () {
    const account = this.findFirstAccount()
    return (account || {}).address
  }
}

export default SecretsStore
