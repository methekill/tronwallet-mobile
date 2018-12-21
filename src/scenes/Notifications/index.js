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
    header: null
  }

  state = {
    list: [],
    isLoading: true,
    noRecords: false
  }

  componentDidMount () {
    setTimeout(() => {
      this._fetchData()
    }, 500)
  }

  _fetchData = () => {
    this.setState({ isLoading: true }, () => {
      getAllNotifications(0, 100)
        .then(list => {
          this.setState({
            list,
            isLoading: false,
            noRecords: list.length === 0
          })
        })
        .catch(() => {
          this.setState({
            isLoading: false
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
    const { list, isLoading, noRecords } = this.state
    return (
      <Utils.SafeAreaView>
        <NavigationHeader
          title={tl.t('notifications.title')}
          onBack={() => this.props.navigation.goBack()}
        />
        <FlatList
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={this._fetchData}
            />
          }
          contentContainerStyle={noRecords ? styles.emptyList : {}}
          data={list}
          keyExtractor={item => item.id}
          renderItem={this._renderItem}
          initialNumToRender={100}
          onEndReachedThreshold={0}
          removeClippedSubviews={Platform.OS === 'android'}
          ListEmptyComponent={noRecords ? (<Utils.Empty text={tl.t('notifications.empty.msg')} />) : null}
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
