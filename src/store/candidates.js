import Realm from 'realm'

const CandidateSchema = {
  name: 'Candidate',
  primaryKey: 'address',
  properties: {
    address: 'string',
    name: 'string',
    url: 'string',
    votes: 'int',
    rank: 'int'
  }
}

export default async () => {
  this.conn = this.conn || await Realm.open({
    path: 'Realm.candidates',
    schema: [CandidateSchema],
    schemaVersion: 3
  })
  return this.conn
}
