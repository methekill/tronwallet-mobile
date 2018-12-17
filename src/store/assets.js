import Realm from 'realm'

const FrozenItemSchema = {
  name: 'FrozenItem',
  properties: {
    days: 'int',
    amount: 'int'
  }
}

const AssetsSchema = {
  name: 'Asset',
  primaryKey: 'id',
  properties: {
    price: 'int',
    issued: 'int',
    issuedPercentage: 'float?',
    available: 'int',
    availableSupply: 'int',
    remaining: 'int',
    remainingPercentage: 'float?',
    percentage: 'float?',
    frozenPercentage: 'float?',
    id: 'string',
    transaction: 'string',
    ownerAddress: 'string',
    name: 'string',
    abbr: 'string',
    totalSupply: 'int',
    trxNum: 'int',
    num: 'int',
    startTime: { type: 'int', indexed: true },
    endTime: { type: 'int', indexed: true },
    voteScore: 'int',
    description: 'string',
    url: 'string',
    dateCreated: 'int'
  }
}

export default async () => {
  this.assets = this.assets ? this.assets : await Realm.open({
    path: 'Realm.assets',
    schema: [AssetsSchema, FrozenItemSchema],
    schemaVersion: 10,
    migration: (oldRealm, newRealm) => {
      const oldObjects = oldRealm.objects('Asset')
      const newObjects = newRealm.objects('Asset')

      for (let i = 0; i < oldObjects.length; i++) {
        if (oldRealm.schemaVersion < 9) {
          newObjects[i].frozen = null
        }
        if (oldRealm.schemaVersion < 10) {
          newObjects[i].block = 1
        }
      }
    }
  })
  return this.assets
}
