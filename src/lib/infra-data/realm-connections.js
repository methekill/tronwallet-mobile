import Realm from 'realm'

export class BasicConnection {
  constructor (connectionInfo) {
    this._connectionInfo = connectionInfo
  }

  runMigration (oldRealm, newRealm) {
  }

  getAdditionalConfiguration () {
    return null
  }

  async open () {
    const config = this.getAdditionalConfiguration() || {}

    return Realm.open({
      migration: this.runMigration,
      ...this._connectionInfo,
      ...config
    })
  }
}

export class CryptoConnection extends BasicConnection {
  constructor (crypto, connectionInfo) {
    super(connectionInfo)
    this._crypto = crypto
  }

  getAdditionalConfiguration () {
    return {
      encriptionKey: this._crypto.getEncryptionKey()
    }
  }
}
