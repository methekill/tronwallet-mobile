import openSocket from 'socket.io-client'
import Config from 'react-native-config'

export default (url = Config.TRONWALLET_STREAM, options = {reconnectionAttempts: 200}) => {
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
