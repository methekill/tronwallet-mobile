import { setPin, getEncryptionKey, clear } from '../crypto'

describe('Crypto', () => {
  beforeEach(() => {
    clear()
  })

  test('should throw error when pin doesn\'t set', () => {
    expect(getEncryptionKey).toThrow()
  })

  test('should generate encryption key when valid pin is set', () => {
    const pin = '123456'
    setPin(pin)

    const encryption = getEncryptionKey()

    const expected = [101, 50, 49, 50, 50, 51, 98, 102, 49, 54, 98, 54, 57, 56, 50, 97, 55, 49, 53, 100, 48, 97, 49, 57, 101, 49, 98, 54, 98, 57, 53, 52, 100, 56, 102, 100, 99, 99, 97, 51, 55, 57, 53, 55, 98, 50, 56, 56, 55, 48, 51, 97, 55, 48, 49, 48, 98, 57, 49, 53, 101, 54, 52, 49]
    const expectedObject = Object.assign({}, expected)

    expect(JSON.stringify(encryption)).toEqual(JSON.stringify(expectedObject))
  })

  test('should throw error when pin set is null', () => {
    const pin = null

    setPin(pin)

    expect(getEncryptionKey).toThrow()
  })
})
