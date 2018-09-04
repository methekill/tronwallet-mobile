const ADDRESS_PREFIX = 'T'
const ADDRESS_SIZE = 34
const PK_SIZE = 64

export const isAddressValid = address => {
  if (!address || !address.length) return false
  if (address.length !== ADDRESS_SIZE) return false
  if (address.charAt(0).toUpperCase() !== ADDRESS_PREFIX.toUpperCase()) {
    return false
  }
  return address.match(/([A-Za-z0-9]){34}/g)
}

export const isPrivateKeyValid = pk => {
  if (!pk || !pk.length) return false
  if (pk.length !== PK_SIZE) return false
  return pk.match(/([A-Z0-9]){64}/g)
}
