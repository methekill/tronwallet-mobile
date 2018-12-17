import React, { Component } from 'react'
import { Platform, StyleSheet, RefreshControl } from 'react-native'
import HTMLView from 'react-native-htmlview'
import { FlatList } from 'react-navigation'

import NavigationHeader from './../../components/Navigation/Header'

import * as Utils from './../../components/Utils'

import ListItem from './../../components/List/ListItem'
import { getAllNotifications } from './../../services/contentful/notifications'
import { postFormat } from './../../utils/dateUtils'
import tl from './../../utils/i18n'
import { Colors } from './../../components/DesignSystem'

class Notifications extends Component {
  static navigationOptions = {
    heder: null
  }

  state = {
    list: [ ],
    refreshing: false
  }

  componentDidMount () {
    this._fetchData()
  }

  _fetchData = () => {
    this.setState({
      refreshing: true
    }, () => {
      getAllNotifications(0, 100)
        .then(list => {
          this.setState({
            list,
            refreshing: false
          })
        })
        .catch(() => {
          this.setState({
            refreshing: false
          })
        })
    })
  }

  _renderItem = ({ item }) => {
    return (
      <ListItem
        title={item.title}
        subtitle={
          <HTMLView
            style={styles.html}
            value={`<span>${item.description || ' '}</span>`}
            stylesheet={styles}
          />
        }
        rightTitle={postFormat(item.updatedAt)}
      />
    )
  }

  render () {
    const { list, refreshing } = this.state
    return (
      <Utils.SafeAreaView>
        <NavigationHeader
          title={tl.t('notifications.notifications.title')}
          onBack={() => this.props.navigation.goBack()}
        />
        <FlatList
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={this._fetchData}
            />
          }
          contentContainerStyle={(list.length === 0 && refreshing === false) ? styles.emptyList : {}}
          data={list}
          keyExtractor={item => item.id}
          renderItem={this._renderItem}
          initialNumToRender={10}
          onEndReachedThreshold={0.75}
          removeClippedSubviews={Platform.OS === 'android'}
          ListEmptyComponent={<Utils.Empty />}
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
  },
  html: {
    padding: 10
  },
  span: {
    color: Colors.greyBlue
  }
})

export default Notifications
