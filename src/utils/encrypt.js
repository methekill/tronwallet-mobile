import crypto from 'crypto-js'

export const encrypt = (secret, password) => crypto.AES.encrypt(secret, password).toString()

export const decrypt = (secret, password) => {
  return crypto.AES.decrypt(secret, password).toString(crypto.enc.Utf8)
}
