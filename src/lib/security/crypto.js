import DeviceInfo from 'react-native-device-info'
import sha256 from 'crypto-js/sha256'
import pbkdf2 from 'crypto-js/pbkdf2'
import hex from 'crypto-js/enc-hex'
import base64 from 'base-64'
import base64js from 'base64-js'

let _encryptionKey = null

export const setPin = (pin) => {
  if (!pin) {
    return
  }

  const idHex = hex.stringify(sha256(DeviceInfo.getDeviceId()))
  const pwdHex = hex.stringify(sha256(pin))

  const key = pbkdf2(pwdHex, idHex, { keySize: 512 / 64 })
  const keyEnc64 = base64.encode(key.toString())

  _encryptionKey = base64js.toByteArray(keyEnc64)
}

export const getEncryptionKey = () => {
  if (!_encryptionKey) {
    throw new Error('Pin isn\'t loaded')
  }

  return _encryptionKey
}

export const clear = () => {
  _encryptionKey = null
}
