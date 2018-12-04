import openSocket from 'socket.io-client'

export default (url = 'http://192.168.0.14:3030', options = {reconnectionAttempts: 200}) => {
  const socket = openSocket(url, options)

  if (__DEV__) {
    socket.on('connect', () => {
      console.warn('Socket Connected', url)
    })
    socket.on('disconnect', () => {
      console.warn('Socket Disconnected', url)
    })
  }

  return socket
}
