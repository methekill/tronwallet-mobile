import get from 'lodash/get'

import contentfulClient from './../contentfulClient'

function parseResults (list = []) {
  if (list.length === 0) {
    return []
  }
  const resultList = []
  list.forEach(item => {
    resultList.push(
      Object.assign({}, item.fields, item.sys)
    )
  })

  return resultList
}

function parseTokenLogo (list = []) {
  if (list.length === 0) {
    return []
  }

  const resultList = []
  list.forEach(item => {
    if (item.tokenLogo) {
      const imageURL = get(item, 'tokenLogo.fields.file.url', null)
      resultList.push(
        Object.assign({}, item, { tokenLogo: `https:${imageURL}` })
      )
    }
  })

  return resultList
}

export const getAllSignals = (skip = 1, limit = 10) => {
  const queryEntry = {
    content_type: 'signals',
    select: 'sys.id,sys.updatedAt,fields.message,fields.title,fields.tokenLogo,fields.tokenName',
    limit,
    skip,
    order: '-sys.updatedAt'
  }
  return contentfulClient.getEntries(queryEntry)
    .then(data => data.items)
    .then(parseResults)
    .then(parseTokenLogo)
    .catch(err => {
      console.log(err)
      return []
    })
}
