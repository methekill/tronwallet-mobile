import { urlify } from './../formatUrl'

describe('Format URL Utils', () => {
  test('#urlify', () => {
    const originalURL = `
      Click here
      (https://medium.com/@tronwallet/twlt-tronwallet-lifetime-subscription-token-69210f61d580)
      for full details on the TWLT
    `

    const expectURL = `
      Click here
      (<a href="https://medium.com/@tronwallet/twlt-tronwallet-lifetime-subscription-token-69210f61d580" target="_blank">https://medium.com/@tronwallet/twlt-tronwallet-lifetime-subscription-token-69210f61d580</a>)
      for full details on the TWLT
    `

    const parsedText = urlify(originalURL)
    expect(parsedText).toMatch(expectURL)
  })
})
