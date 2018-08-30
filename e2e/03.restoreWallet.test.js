/* eslint-env detox/detox, jest */
import translation from '../src/utils/translations/en'

describe('Restore Wallet', async () => {
  beforeEach(async () => {
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

  it('should show the restore scene', async () => {
    await expect(element(by.text(translation.seed.restore.title))).toBeVisible()
    await expect(element(by.id('restoreInput'))).toBeVisible()
    await expect(element(by.id('RestoreButton'))).toBeVisible()
  })

  it('should fail if user type an invalid key', async () => {
    await element(by.id('restoreInput')).typeText('anything that is not a key')
    await element(by.id('RestoreButton')).tap()
    await element(by.text('OK')).tap()
    await expect(element(by.label(translation.seed.restore.error))).toBeVisible()
  })

  it('should successfully restore account if the seed is valid', async () => {
    await element(by.id('restoreInput')).typeText('twelve polar broken pill ordinary put solve mushroom trumpet script pattern truly')
    await element(by.id('RestoreButton')).tap()
    await element(by.text('OK')).tap()
    await expect(element(by.label(translation.seed.restore.success))).toBeVisible()
  })
})
