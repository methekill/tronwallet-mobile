import React, { Component } from 'react'
import { FlatList, Platform, StyleSheet, RefreshControl } from 'react-native'
import HTMLView from 'react-native-htmlview'

import * as Utils from './../../components/Utils'

import ListItem from './../../components/List/ListItem'

import { getAllSignals } from './../../services/contentful/notifications'

import { postFormat } from './../../utils/dateUtils'
import { withContext } from './../../store/context'
import tl from './../../utils/i18n'
import { Colors } from './../../components/DesignSystem'

class Signals extends Component {
  static navigationOptions = {
    title: tl.t('notifications.signals.title')
  }
  static displayName = 'Signals Screen'

  state = {
    list: [],
    refreshing: false
  }

  componentDidMount () {
    this._fetchData()
  }

  _fetchData = () => {
    this.setState({
      refreshing: true
    }, () => {
      getAllSignals(1, 100)
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
            value={`<span>${item.message || ' '}</span>`}
            stylesheet={styles}
          />
        }
        rightTitle={postFormat(item.updatedAt)}
        avatar={{ uri: item.tokenLogo }}
      />
    )
  }

  render () {
    const { list, refreshing } = this.state
    return (
      <Utils.SafeAreaView>
        <FlatList
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={this._fetchData}
            />
          }
          contentContainerStyle={(list.length === 0 && refreshing === false) ? styles.emptyList : styles.list}
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
  list: {
    paddingTop: 10
  },
  html: {
    padding: 10
  },
  span: {
    color: Colors.greyBlue
  }
})

export default withContext(Signals)
