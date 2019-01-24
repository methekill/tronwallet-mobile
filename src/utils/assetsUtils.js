import Client from '../services/client'
import getAssetsStore from '../store/assets'
import { FEATURED_TOKENS, VERIFIED_TOKENS } from './constants'

/**
 * TronScan API Adapter
 */
function assetAdapter (asset) {
  return {
    ...asset,
    id: asset.tokenID.toString(),
    transaction: asset.transaction || 'N/A'
  }
}

export const updateAssets = async (start = 0, limit = 100, tokenId = '') => {
  const assets = await Client.getTokenList(start, limit, tokenId)
  const store = await getAssetsStore()
  store.write(() => assets.map(asset => {
    store.create('Asset', assetAdapter(asset), true)
  }))

  return assets
}

export const getCustomName = (name, id) => {
  switch (id) {
    case '1000451':
      return 'LoveHearts \u2665'
    default:
      return name
  }
}

export const orderAssets = (assets) => {
  let orderedVerified = []
  let orderedFeatured = []
  let rest = []

  const verifyAsset = (asset, index, featured = false) => {
    asset.verified = true
    asset.featured = featured
    if (featured) orderedFeatured[index] = asset
    else orderedVerified[index] = asset
  }
  assets.forEach(asset => {
    if (asset.name === 'TRX') {
      asset.verified = true
      asset.featured = false
      orderedFeatured.unshift(asset)
    }
    const featuredIndex = FEATURED_TOKENS.findIndex(token => token === asset.name)
    // featuredIndex + plus one because of the TRX
    if (featuredIndex > -1) return verifyAsset(asset, featuredIndex + 1, true)

    const verifiedIndex = VERIFIED_TOKENS.findIndex(token => token === asset.name)
    if (verifiedIndex > -1) return verifyAsset(asset, verifiedIndex)

    rest.push(asset)
  })

  return [
    ...orderedFeatured.filter((asset) => asset),
    ...orderedVerified.filter((asset) => asset),
    ...rest.sort((a, b) => b.issuedPercentage - a.issuedPercentage)
  ]
}
