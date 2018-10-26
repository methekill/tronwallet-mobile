import Realm from 'realm'

const BalanceSchema = {
  name: 'Balance',
  primaryKey: 'id',
  properties: {
    id: 'string',
    account: 'string',
    balance: 'float',
    name: 'string'
  }
}

export default async () => {
  this.balance = this.balance ? this.balance : await Realm.open({
    path: 'Realm.balance',
    schema: [BalanceSchema],
    schemaVersion: 2,
    migration: (oldRealm, newRealm) => {
      if (oldRealm.schemaVersion < 1) {
        const oldObjects = oldRealm.objects('Balance')
        const newObjects = newRealm.objects('Balance')

        for (let i = 0; i < oldObjects.length; i++) {
          newObjects[i].account = 'undefined'
        }
      }
      if (oldRealm.schemaVersion < 2) {
        const oldObjects = oldRealm.objects('Balance')
        const newObjects = newRealm.objects('Balance')

        for (let i = 0; i < oldObjects.length; i++) {
          newObjects[i].id = oldObjects[i].account + oldObjects[i].name
        }
      }
    }
  })
  return this.balance
}
