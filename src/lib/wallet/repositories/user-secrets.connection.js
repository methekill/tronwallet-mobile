import { CryptoConnection } from '../../infra-data/realm-connections'
import { UserSecret } from '../wallet.models'

class UserSecretConnection extends CryptoConnection {
  constructor (crypto) {
    super(crypto, {
      path: `realm.userSecrets`,
      schema: [UserSecret],
      schemaVersion: 2
    })
  }

  runMigration (oldRealm, newRealm) {
    const newObjects = newRealm.objects('UserSecret')
    if (!newObjects.length) {
      return
    }

    if (oldRealm.schemaVersion < 1) {
      newObjects[0].name = 'Main Account'
      newObjects[0].alias = '@main_account'
    }

    if (oldRealm.schemaVersion < 2) {
      newObjects.forEach(object => {
        object.hide = false
      })
    }
  }
}

export default UserSecretConnection
