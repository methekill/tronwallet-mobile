import React, { Component } from 'react'
import { FlatList, Platform, StyleSheet } from 'react-native'

import * as Utils from './../../components/Utils'

import ListItem from './../../components/List/ListItem'

import { getAllSignals } from './../../services/contentful/notifications'

import { postFormat } from './../../utils/dateUtils'
import { withContext } from './../../store/context'
import tl from './../../utils/i18n'

class Signals extends Component {
  static navigationOptions = {
    title: tl.t('notifications.signals.title')
  }
  static displayName = 'Signals Screen'

  state = {
    list: []
  }

  componentDidMount = () => {
    getAllSignals(1, 100)
      .then(list => {
        this.setState({
          list
        })
      })
  }

  _renderItem = ({ item }) => {
    return (
      <ListItem
        title={item.title}
        subtitle={item.message}
        rightTitle={postFormat(item.updatedAt)}
        avatar={{ uri: item.tokenLogo }}
      />
    )
  }

  render () {
    const { list } = this.state
    return (
      <Utils.SafeAreaView>
        <FlatList
          contentContainerStyle={list.length === 0 ? styles.emptyList : {}}
          data={list}
          // ListEmptyComponent={<Empty loading={refreshing} />}
          keyExtractor={item => item.id}
          renderItem={this._renderItem}
          initialNumToRender={10}
          onEndReachedThreshold={0.75}
          removeClippedSubviews={Platform.OS === 'android'}
        />
      </Utils.SafeAreaView>
    )
  }
}

const styles = StyleSheet.create({
  emptyList: {
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%'
  }
})

export default withContext(Signals)
