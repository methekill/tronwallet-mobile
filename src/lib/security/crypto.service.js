import DeviceInfo from 'react-native-device-info'
import sha256 from 'crypto-js/sha256'
import pbkdf2 from 'crypto-js/pbkdf2'
import hex from 'crypto-js/enc-hex'
import base64 from 'base-64'
import base64js from 'base64-js'

class Crypto {
  constructor () {
    this.hash = null
    this._encryptionKey = null
  }

  setPin (pin) {
    const idHex = hex.stringify(sha256(DeviceInfo.getDeviceId()))
    const pwdHex = hex.stringify(sha256(this._pin))

    const key = pbkdf2(pwdHex, idHex, { keySize: 512 / 64 })
    const keyEnc64 = base64.encode(key.toString())

    this._encryptionKey = base64js.toByteArray(keyEnc64)
  }

  getEncryptionKey () {
    if (!this._encryptionKey) {
      throw new Error('Pin isn\'t loaded')
    }

    return this._encryptionKey
  }
}

export default Crypto
