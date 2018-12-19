import React from 'react'
import { TouchableOpacity } from 'react-native'
import Feather from 'react-native-vector-icons/Feather'
import { func, bool, string } from 'prop-types'

import SyncButton from '../SyncButton'

const AddAccountButton = ({ onPress, loading, secretMode }) => {
  if (secretMode === 'privatekey') {
    return null
  }

  return (
    <TouchableOpacity onPress={onPress} disabled={loading} >
      {loading
        ? (<SyncButton loading />)
        : (<Feather name='plus' color={'white'} size={28} />)}
    </TouchableOpacity>
  )
}

AddAccountButton.propTypes = {
  onPress: func,
  loading: bool,
  secretMode: string.isRequired
}

AddAccountButton.defaultProps = {
  onPress: () => {},
  loading: false
}

export default AddAccountButton
