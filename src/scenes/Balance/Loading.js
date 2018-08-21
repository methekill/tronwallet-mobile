import React from 'react'
import { ActivityIndicator } from 'react-native'

const Loading = ({ loading, children }) => loading ? <ActivityIndicator /> : children

export default Loading
