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

export function isURL (text) {
  const pattern = /^(https?:\/\/)?((([a-z\d]([a-z\d-]*[a-z\d])*)\.)+[a-z]{2,}|((\d{1,3}\.){3}\d{1,3}))(:\d+)?(:\d+)?(\/[-a-z\d%_.~+]*)*(\?[;&a-z\d%_.~+=-]*)?(#[-a-z\d_]*)?$/i
  return pattern.test(text)
}
