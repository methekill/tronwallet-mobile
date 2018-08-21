import RNTron from 'react-native-tron'
import DeviceInfo from 'react-native-device-info'
import { AsyncStorage } from 'react-native'

import getSecretsStore from '../store/secrets'
import { resetWalletData } from './userAccountUtils'
import Client from '../services/client'
import { USER_STATUS } from '../utils/constants'

export const createUserKeyPair = async (pin, oneSignalId) => {
  const mnemonic = await RNTron.generateMnemonic()
  await generateKeypair(pin, oneSignalId, mnemonic, 0, true)
  AsyncStorage.setItem(USER_STATUS, 'active')
}

export const recoverUserKeypair = async (
  pin,
  oneSignalId,
  mnemonic,
  vaultNumber = 0,
  randomlyGenerated = false
) => {
  await RNTron.validateMnemonic(mnemonic)
  await generateKeypair(pin, oneSignalId, mnemonic, vaultNumber, randomlyGenerated)
  AsyncStorage.setItem(USER_STATUS, 'active')
}

export const createNewAccount = async (pin, oneSignalId) => {
  const accounts = await getUserSecrets(pin)
  const { mnemonic } = accounts[0]
  const generatedKeypair = await RNTron.generateKeypair(mnemonic, accounts.length, false)
  generatedKeypair.mnemonic = mnemonic
  generatedKeypair.name = `Account ${accounts.length}`
  generatedKeypair.alias = `@account${accounts.length}`
  generatedKeypair.confirmed = true
  const secretsStore = await getSecretsStore(pin)
  await secretsStore.write(() => secretsStore.create('Account', generatedKeypair, true))
  Client.registerDeviceForNotifications(oneSignalId, generatedKeypair.address)
}

const generateKeypair = async (pin, oneSignalId, mnemonic, vaultNumber, randomlyGenerated) => {
  const generatedKeypair = await RNTron.generateKeypair(mnemonic, 0, false)
  generatedKeypair.mnemonic = mnemonic
  generatedKeypair.confirmed = !randomlyGenerated
  generatedKeypair.name = 'Main Account'
  generatedKeypair.alias = '@main_account'
  const secretsStore = await getSecretsStore(pin)
  await secretsStore.write(() => secretsStore.create('Account', generatedKeypair, true))
  Client.registerDeviceForNotifications(oneSignalId, generatedKeypair.address)
  await resetWalletData()
}

export const confirmSecret = async pin => {
  try {
    const secretsStore = await getSecretsStore(pin)
    const deviceId = await DeviceInfo.getUniqueID()
    secretsStore.write(() => {
      const secret = secretsStore.objects('Account')
      secret.confirmed = true
      secretsStore.create('Account', { id: deviceId, confirmed: true }, true)
    })
  } catch (error) {
    throw error
  }
}

export const getUserSecrets = async pin => {
  const secretsStore = await getSecretsStore(pin)
  const secrets = secretsStore
    .objects('Account')
    .map(item => Object.assign({}, item))
  return secrets
}

export const resetSecretData = async pin => {
  const secretsStore = await getSecretsStore(pin)
  const secretList = secretsStore.objects('Account')
  await secretsStore.write(() => secretsStore.delete(secretList))
}
