export default url => {
  let tempUrl = url.replace(/^(?:https?:\/\/)?(?:www\.)?/i, '')
  if (tempUrl.length > 35) {
    tempUrl = `${tempUrl.slice(0, 28)}...`
  }
  return tempUrl
}

// url = url.replace(/(^\w+:|^)\/\//, '')

export function urlify (text) {
  const urlRegex = /(((https?:\/\/)|(www\.))[^\s^)]+)/g
  return text.replace(urlRegex, (url, b, c) => {
    const parseURL = (c === 'www.') ? 'http://' + url : url
    return `<a href="${parseURL}" target="_blank">${url}</a>`
  })
}
