import Realm from 'realm'

const ContactsSchema = {
  name: 'Contact',
  primaryKey: 'address',
  properties: {
    address: 'string',
    name: 'string',
    alias: 'string'
  }
}

export default async () =>
  Realm.open({
    path: 'Realm.contacts',
    schema: [ContactsSchema],
    schemaVersion: 0
  })
