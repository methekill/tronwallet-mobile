import contentfulClient from './index'

const SYSTEM_CONTENT = '11bJZFl0J6CMEwoMi20sqC'

const defaultParams = {
  content_type: 'asset',
  order: '-fields.isFeatured,-fields.isVerified,fields.position,-fields.issuedPercentage',
  'fields.isListed': true,
  'fields.issuedPercentage[lt]': 100,
  'fields.startTime[lt]': Date.now(),
  'fields.endTime[gte]': Date.now()
}

export const BATCH_NUMBER = 30

export const getTokens = async (start = 0) => {
  const queryEntry = {
    ...defaultParams,
    skip: start,
    limit: BATCH_NUMBER
  }

  const { total, items: featuredTokens } = await contentfulClient.getEntries(queryEntry)
  const featured = []
  const assets = []
  const allAssets = []
  featuredTokens.map(({sys: { id: contentfulId }, fields: token}) => {
    const asset = {...token, contentfulId}
    if (token.isFeatured) {
      const image = token.featuredCover ? `https:${token.featuredCover.fields.file.url}` : null
      featured.push({...asset, image})
      allAssets.push({...asset, image})
    } else {
      allAssets.push(asset)
      assets.push(asset)
    }
  })
  return {featured, assets, allAssets, totalTokens: total}
}

export const queryToken = async (name = '', params = defaultParams) => {
  const queryEntry = {
    ...params,
    'fields.name[match]': name,
    limit: 5
  }

  const { total, items: assets } = await contentfulClient.getEntries(queryEntry)
  const results = assets.map(({fields}) => fields)
  return { total, results }
}
// Deprecated
// export const getFixedTokens = async () => {
//   const queryEntry = {
//     content_type: 'asset',
//     order: '-fields.isFeatured,fields.position',
//     select: 'fields.name',
//     'fields.isVerified': true
//   }

//   const { items: featuredTokens } = await contentfulClient.getEntries(queryEntry)
//   const fixedNames = featuredTokens.map(({fields: token}) => token.name)
//   return ['TRX', ...fixedNames]
// }

export const getFixedTokensV2 = async () => {
  const queryEntry = {
    content_type: 'asset',
    order: '-fields.isFeatured,fields.position',
    select: 'fields.name,fields.id',
    'fields.isVerified': true
  }

  const { items: featuredTokens } = await contentfulClient.getEntries(queryEntry)
  const fixedTokensId = featuredTokens.map(({fields: token}) => ({id: token.id, name: token.name}))
  return [{name: 'TRX', id: '1'}, ...fixedTokensId]
}

export const getSystemStatus = async () => {
  const systemEntry = await contentfulClient.getEntry(SYSTEM_CONTENT)
  const { fields: { showStatus, statusMessage, statusColor, messageColor, systemAddress } } = systemEntry
  return {
    systemStatus: { showStatus, statusMessage, statusColor, messageColor },
    systemAddress
  }
}

export const getExchangeContentful = async () => {
  const queryEntry = { content_type: 'exchange' }
  const { items: exchangesAvailable } = await contentfulClient.getEntries(queryEntry)
  return exchangesAvailable.reduce((list, {fields: ex}) => {
    if (ex.isEnabled) {
      const firstTokenImage = ex.firstTokenImage ? `https:${ex.firstTokenImage.fields.file.url}` : null
      const secondTokenImage = ex.secondTokenImage ? `https:${ex.secondTokenImage.fields.file.url}` : null
      list.push({
        firstTokenAbbr: ex.firstTokenAbbr,
        secondTokenAbbr: ex.secondTokenAbbr,
        exchangeId: ex.exchangeId,
        isEnabled: ex.isEnabled,
        firstTokenImage,
        secondTokenImage
      })
    }
    return list
  }, [])
}

export const getDApps = async () => {
  try {
    const queryEntry = { content_type: 'dApps' }
    const { items } = await contentfulClient.getEntries(queryEntry)

    return items
      .map(({ fields }) => fields)
      .filter(dapp => {
        if (dapp.isVisible) return dapp
      })
      .map(item => ({ ...item, image: `https:${item.image.fields.file.url}` }))
  } catch (e) {
    return []
  }
}

export const getPrivacyPolicy = async () => {
  try {
    const queryEntry = { content_type: 'privacyPolicy' }
    const { items } = await contentfulClient.getEntries(queryEntry)
    return items.map(({ fields }) => fields)[0]
  } catch (e) {
    return []
  }
}
