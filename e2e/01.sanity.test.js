/* eslint-env detox/detox, jest */

describe('Sanity', () => {
  beforeEach(async () => {
    await device.launchApp({
      newInstance: true,
      permissions: { notifications: 'YES' }
    })
  })

  it('should show first time scene', async () => {
    await expect(element(by.text('CREATE WALLET'))).toBeVisible()
    await expect(element(by.text('RESTORE WALLET'))).toBeVisible()
  })
})
