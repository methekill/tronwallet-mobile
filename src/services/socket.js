import openSocket from 'socket.io-client'
import Config from 'react-native-config'

export default (url = Config.TRONWALLET_STREAM, options = {reconnectionAttempts: 200}) => {
  const socket = openSocket(url, options)
  return socket
}
