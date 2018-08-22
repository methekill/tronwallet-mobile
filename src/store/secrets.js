import Realm from 'realm'
import sha256 from 'crypto-js/sha256'
import pbkdf2 from 'crypto-js/pbkdf2'
import hex from 'crypto-js/enc-hex'
import base64 from 'base-64'
import base64js from 'base64-js'
import DeviceInfo from 'react-native-device-info'

const AccountSchema = {
  name: 'Account',
  primaryKey: 'address',
  properties: {
    confirmed: 'bool',
    address: 'string',
    password: 'string',
    mnemonic: 'string',
    privateKey: 'string',
    publicKey: 'string',
    name: 'string',
    alias: 'string'
  },
  schemaVersion: 2
}

const getStore = async pin => {
  const idHex = hex.stringify(sha256(DeviceInfo.getDeviceId()))
  const pwdHex = hex.stringify(sha256(pin))

  const key = pbkdf2(pwdHex, idHex, { keySize: 512 / 64 })
  const keyEnc64 = base64.encode(key.toString())
  const keyBytes = base64js.toByteArray(keyEnc64)

  return Realm.open({
    path: `realm.Accounts`,
    schema: [AccountSchema],
    encryptionKey: keyBytes,
    migration: (oldRealm, newRealm) => {
      if (oldRealm.schemaVersion < 1) {
        const oldObjects = oldRealm.objects('Secret')

        newRealm.create('Account', {
          confirmed: oldObjects[0].confirmed,
          address: oldObjects[0].address,
          password: oldObjects[0].password,
          mnemonic: oldObjects[0].mnemonic,
          privateKey: oldObjects[0].privateKey,
          publicKey: oldObjects[0].publicKey,
          name: 'Main Account',
          alias: '@main_account'
        })
      }
    }
  })
}

export default getStore
