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

export default async () => {
  this.contacts = this.contacts ? this.contacts : await Realm.open({
    path: 'Realm.contacts',
    schema: [ContactsSchema],
    schemaVersion: 0
  })
  return this.contacts
}
