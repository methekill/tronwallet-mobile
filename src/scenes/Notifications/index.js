import React, { Component } from 'react'
import { FlatList, Platform, StyleSheet } from 'react-native'

import * as Utils from './../../components/Utils'

import ListItem from './../../components/List/ListItem'
import { getAllNotifications } from './../../services/contentful/notifications'
import { postFormat } from './../../utils/dateUtils'
import tl from './../../utils/i18n'

class Notifications extends Component {
  static navigationOptions = {
    title: tl.t('notifications.notifications.title')
  }

  state = {
    list: [ ]
  }

  componentDidMount = () => {
    getAllNotifications().then(data => {
      this.setState({
        list: data
      })
    })
  }

  _renderItem = ({ item }) => {
    return (
      <ListItem
        title={item.title}
        subtitle={item.description}
        rightTitle={postFormat(item.updatedAt)}
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

export default Notifications
