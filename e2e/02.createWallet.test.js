/* eslint-env detox/detox, jest */
import translation from '../src/utils/translations/en'

describe('Create Wallet', () => {
  beforeEach(async () => {
    await device.launchApp({
      delete: true,
      newInstance: true,
      permissions: { notifications: 'YES' }
    })
  })

  it('should ask for pin after tap on CREATE WALLET button', async () => {
    await expect(element(by.text(translation.firstTime.button.create))).toBeVisible()
    await element(by.text(translation.firstTime.button.create)).tap()
    await expect(element(by.text(translation.pin.enter))).toBeVisible()
  })

  it('should ask to confirm pin on first time', async () => {
    await element(by.text(translation.firstTime.button.create)).tap()
    await element(by.text('0')).tap()
    await element(by.text('0')).tap()
    await element(by.text('0')).tap()
    await element(by.text('0')).tap()
    await element(by.text('0')).tap()
    await element(by.text('0')).tap()
    await expect(element(by.text(translation.pin.reenter))).toBeVisible()
  })

  it('should go to Confirm Seed after PIN confirmation', async () => {
    await element(by.text(translation.firstTime.button.create)).tap()
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
    // confirm seed
    await expect(element(by.text(translation.seed.create.title))).toBeVisible()
  })

  describe('Confirm Seed', () => {
    beforeEach(async () => {
      await device.launchApp({
        delete: true,
        newInstance: true,
        permissions: { notifications: 'YES' }
      })
      // create wallet
      await element(by.text(translation.firstTime.button.create)).tap()
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

    it('should show the generated seed', async () => {
      await expect(element(by.text(translation.seed.create.title))).toBeVisible()
      await expect(
        element(
          by.text(
            'twelve polar broken pill ordinary put solve mushroom trumpet script pattern truly'
          )
        )
      ).toBeVisible()
    })

    it('should show action buttons', async () => {
      await expect(element(by.text(translation.seed.create.button.newSeed))).toBeVisible()
      await expect(element(by.text(translation.seed.create.button.written))).toBeVisible()
      await expect(element(by.text(translation.seed.create.button.later))).toBeVisible()
    })

    it('should get a new seed on GET NEW SEED button', async () => {
      await element(by.text(translation.seed.create.button.newSeed)).tap()
      await expect(
        element(
          by.text(
            'swift tissue develop cage struggle minor snack cancel average daughter dutch faculty'
          )
        )
      ).toBeVisible()
    })

    it('should go to confirm scene on IVE WRITTEN IT DOWN button', async () => {
      await element(by.text(translation.seed.create.button.written)).tap()
      await expect(element(by.id('ConfirmSeed'))).toBeVisible()
    })

    it('should show all the words from the seed', async () => {
      await element(by.text(translation.seed.create.button.written)).tap()
      // check all the words
      await expect(element(by.text('twelve'))).toBeVisible()
      await expect(element(by.text('polar'))).toBeVisible()
      await expect(element(by.text('broken'))).toBeVisible()
      await expect(element(by.text('pill'))).toBeVisible()
      await expect(element(by.text('ordinary'))).toBeVisible()
      await expect(element(by.text('put'))).toBeVisible()
      await expect(element(by.text('solve'))).toBeVisible()
      await expect(element(by.text('mushroom'))).toBeVisible()
      await expect(element(by.text('trumpet'))).toBeVisible()
      await expect(element(by.text('script'))).toBeVisible()
      await expect(element(by.text('pattern'))).toBeVisible()
      await expect(element(by.text('truly'))).toBeVisible()
    })

    it('should fail if seed does not match the correct order', async () => {
      await element(by.text(translation.seed.create.button.written)).tap()
      // check all the words
      await element(by.text('twelve')).tap()
      await element(by.text('polar')).tap()
      await element(by.text('broken')).tap()
      await element(by.text('pill')).tap()
      await element(by.text('ordinary')).tap()
      await element(by.text('put')).tap()
      await element(by.text('solve')).tap()
      await element(by.text('mushroom')).tap()
      await element(by.text('trumpet')).tap()
      await element(by.text('script')).tap()
      // swapped elements
      await element(by.text('truly')).tap()
      await element(by.text('pattern')).tap()
      // try to confirm
      await element(by.id('ConfirmButton')).tap()
      // error alert should be visible
      await element(by.label(translation.seed.confirm.error.title)).toBeVisible()
    })

    it('should be reset to initial state', async () => {
      await element(by.text(translation.seed.create.button.written)).tap()
      // check all the words
      await element(by.text('twelve')).tap()
      await element(by.text('polar')).tap()
      await element(by.text('broken')).tap()
      await element(by.text('pill')).tap()
      await element(by.text('ordinary')).tap()
      await element(by.text('put')).tap()
      await element(by.text('solve')).tap()
      await element(by.text('mushroom')).tap()
      await element(by.text('trumpet')).tap()
      await element(by.text('script')).tap()
      await element(by.text('pattern')).tap()
      await element(by.text('truly')).tap()
      // reset
      await element(by.text(translation.seed.confirm.button.reset)).tap()
      // check if they are in remainingWords
      await expect(element(by.text('twelve').withAncestor(by.id('remainingWords')))).toExist()
      await expect(element(by.text('polar').withAncestor(by.id('remainingWords')))).toExist()
      await expect(element(by.text('broken').withAncestor(by.id('remainingWords')))).toExist()
      await expect(element(by.text('pill').withAncestor(by.id('remainingWords')))).toExist()
      await expect(element(by.text('ordinary').withAncestor(by.id('remainingWords')))).toExist()
      await expect(element(by.text('put').withAncestor(by.id('remainingWords')))).toExist()
      await expect(element(by.text('solve').withAncestor(by.id('remainingWords')))).toExist()
      await expect(element(by.text('mushroom').withAncestor(by.id('remainingWords')))).toExist()
      await expect(element(by.text('trumpet').withAncestor(by.id('remainingWords')))).toExist()
      await expect(element(by.text('script').withAncestor(by.id('remainingWords')))).toExist()
      await expect(element(by.text('pattern').withAncestor(by.id('remainingWords')))).toExist()
      await expect(element(by.text('truly').withAncestor(by.id('remainingWords')))).toExist()
    })

    it('should successfully confirm the seed and create the wallet', async () => {
      await element(by.text(translation.seed.create.button.written)).tap()
      // check all the words
      await element(by.text('twelve')).tap()
      await element(by.text('polar')).tap()
      await element(by.text('broken')).tap()
      await element(by.text('pill')).tap()
      await element(by.text('ordinary')).tap()
      await element(by.text('put')).tap()
      await element(by.text('solve')).tap()
      await element(by.text('mushroom')).tap()
      await element(by.text('trumpet')).tap()
      await element(by.text('script')).tap()
      await element(by.text('pattern')).tap()
      await element(by.text('truly')).tap()
      // confirm
      await element(by.id('ConfirmButton')).tap()
      // go to balance
      await element(by.text('BALANCE')).toBeVisible()
    })
  })
})
