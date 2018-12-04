import Realm from 'realm'
import { UserSecret } from './models'
import { getEncryptionKey } from '../security/crypto'
import RealmStore from '../infra-data/realm.store'

const migration = (oldRealm, newRealm) => {
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

export const openRealmConnection = () => Realm.open({
  path: `realm.userSecrets`,
  schema: [UserSecret],
  schemaVersion: 2,
  encryptionKey: getEncryptionKey(),
  migration
})

export default async () => {
  if (!this.instance) {
    const connection = await openRealmConnection()
    this.instance = new RealmStore(connection, 'UserSecrets')
  }

  return this.instance
}
