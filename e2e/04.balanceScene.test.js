/* eslint-env detox/detox, jest */
import translation from '../src/utils/translations/en'

describe('Balance Scene', () => {
  beforeAll(async () => {
    await device.launchApp({
      delete: true,
      newInstance: true,
      permissions: { notifications: 'YES' }
    })
    // create wallet
    await element(by.text(translation.firstTime.button.restore)).tap()
    // enter PIN
    await element(by.text('0')).tap()
    await element(by.text('0')).tap()
    await element(by.text('0')).tap()
    await element(by.text('0')).tap()
    await element(by.text('0')).tap()
    await element(by.text('0')).tap()
    // re-enter PIN
    await element(by.text('0')).tap()
    await element(by.text('0')).tap()
    await element(by.text('0')).tap()
    await element(by.text('0')).tap()
    await element(by.text('0')).tap()
    await element(by.text('0')).tap()
  })

  beforeEach(async () => {
    await device.reloadReactNative()
    // enter pin
    await element(by.text('0')).tap()
    await element(by.text('0')).tap()
    await element(by.text('0')).tap()
    await element(by.text('0')).tap()
    await element(by.text('0')).tap()
    await element(by.text('0')).tap()
  })

  it('should show the balance scene', async () => {
    await expect(element(by.text('BALANCE'))).toBeVisible()
    await expect(element(by.text('RECEIVE'))).toBeVisible()
    await expect(element(by.text('FREEZE'))).toBeVisible()
    await expect(element(by.text('SEND'))).toBeVisible()
  })

  // RECEIVE
  it('should show Receive scene by taping on receive button', async () => {
    await element(by.text('RECEIVE')).tap()
    await expect(element(by.text('RECEIVE'))).toBeVisible()
    await expect(element(by.id('HeaderClose'))).toBeVisible()
    await expect(element(by.id('QRCode'))).toBeVisible()
    await expect(element(by.text('TQdBZKGwLZ9yjwY5Cn4d7A39BxECx7ukuS'))).toBeVisible()
    await expect(element(by.text('Copy'))).toBeVisible()
    await expect(element(by.text('Share'))).toBeVisible()
  })

  it('should show toast when copying address to clipboard', async () => {
    await element(by.text('RECEIVE')).tap()
    await expect(element(by.text('Copy'))).toBeVisible()
    await element(by.text('Copy')).tap()
    await expect(element(by.text('Copied to clipboard'))).toBeVisible()
  })
})
