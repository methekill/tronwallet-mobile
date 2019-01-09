import Realm from 'realm'

const VoteSchema = {
  name: 'Vote',
  properties: {
    voteAddress: 'string',
    voteCount: 'int'
  }
}

const ContractDataSchema = {
  name: 'ContractData',
  properties: {
    amount: 'int?',
    frozenBalance: 'int?',
    transferFromAddress: 'string?',
    transferToAddress: 'string?',
    tokenName: 'string?',
    tokenId: 'string?',
    votes: 'Vote[]',
    description: 'string?',
    startTime: 'int?',
    endTime: 'int?',
    totalSupply: 'int?',
    unityValue: 'int?'
  }
}

const TransactionSchema = {
  name: 'Transaction',
  primaryKey: 'id',
  properties: {
    id: 'string',
    timestamp: 'int',
    type: 'string',
    block: 'int?',
    ownerAddress: 'string',
    contractData: 'ContractData',
    confirmed: 'bool?',
    notified: { type: 'bool', default: true }
  }
}

export const createNewTransactionStore = () => Realm.open({
  path: 'Realm.transactions',
  schema: [TransactionSchema, ContractDataSchema, VoteSchema],
  schemaVersion: 16,
  migration: (oldRealm, newRealm) => {
    const transactions = newRealm.objects('Transaction')
    for (let i = 0; i < transactions.length; i++) {
      if (oldRealm.schemaVersion < 15) {
        transactions[i].notified = true
      }
      if (oldRealm.schemaVersion < 16) {
        if (transactions[i].contractData.assetName) {
          transactions[i].contractData.tokenId = transactions[i].contractData.assetName
        }
      }
    }
  }
})

export default async () => {
  this.transactions = this.transactions ? this.transactions : await createNewTransactionStore()
  return this.transactions
}
