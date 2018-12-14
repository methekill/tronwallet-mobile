import React, { Component } from 'react'
import { Platform, StyleSheet, RefreshControl } from 'react-native'
import { FlatList } from 'react-navigation'
import HTMLView from 'react-native-htmlview'
import Modal from 'react-native-modal'
import LottieView from 'lottie-react-native'
import MixPanel from 'react-native-mixpanel'

import * as Utils from './../../components/Utils'
import ListItem from './../../components/List/ListItem'
import { CloseButton, ModalContainer } from './elements'
import NavigationHeader from './../../components/Navigation/Header'

import { getAllSignals } from './../../services/contentful/notifications'
import { queryToken } from './../../services/contentful'

import { postFormat } from './../../utils/dateUtils'
import tl from './../../utils/i18n'
import { Colors } from './../../components/DesignSystem'
import { logSentry } from './../../utils/sentryUtils'

class Signals extends Component {
  static navigationOptions = {
    header: null
  }
  static displayName = 'Signals Screen'

  state = {
    list: [],
    refreshing: false,
    isModalVisible: false,
    msg: tl.t('balanceToken.updating')
  }

  componentDidMount () {
    this._fetchData()
  }

  _fetchData = () => {
    this.setState({ refreshing: true }, () => {
      getAllSignals(0, 100)
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

  _onSuccess = (item) => {
    if (item) {
      if (this.searchAnimate) {
        this.searchAnimate.reset()
      }
      this.setState({ isModalVisible: false }, () => {
        setTimeout(() => {
          this.props.navigation.navigate('TokenDetailScene', { item, fromBalance: false })
          MixPanel.trackWithProperties(this.displayName, {
            type: `Navigate from ${this.displayName} to Token Info`,
            token: item.name
          })
        }, 400)
      })
    } else {
      this._onError()
    }
  }

  _onError = () => {
    this.setState({ msg: tl.t('balanceToken.notAvailable') }, () => {
      if (this.searchAnimate) {
        this.searchAnimate.reset()
      }
    })
  }

  _searchAndNavigate = async (tokenName) => {
    try {
      const customParams = {
        content_type: 'asset',
        order: '-fields.isFeatured,-fields.isVerified,fields.position'
      }
      queryToken(false, tokenName, customParams)
        .then(response => response.total > 0 ? response.results[0] : null)
        .then(this._onSuccess)
    } catch (error) {
      logSentry(error, `${this.displayName} - error when token is requested`)
      this._onError()
    }
  }

  _onItemPress = (tokenName) => {
    this.setState({
      isModalVisible: true,
      msg: tl.t('balanceToken.updating'),
      requestTokenInfo: false
    }, () => this._searchAndNavigate(tokenName))
  }

  _renderItem = ({ item }) => {
    return (
      <ListItem
        onPress={() => this._onItemPress(item.tokenName)}
        title={item.title}
        subtitle={
          <HTMLView
            style={styles.html}
            value={`<span>${item.message || ' '}</span>`}
            stylesheet={styles}
          />
        }
        rightTitle={postFormat(item.updatedAt)}
        avatar={item.tokenLogo ? { uri: item.tokenLogo } : null}
      />
    )
  }

  render () {
    const { list, refreshing } = this.state
    return (
      <Utils.SafeAreaView>
        <NavigationHeader
          title={tl.t('notifications.signals.title')}
          onBack={() => this.props.navigation.goBack()}
        />
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

        <Modal
          isVisible={this.state.isModalVisible}
          animationIn='fadeInDown'
          animationOut='fadeOutUp'
        >
          <Utils.View flex={1} align='center' justify='center'>
            <ModalContainer>
              <CloseButton onPress={() => this.setState({ isModalVisible: false })} />
              <LottieView
                ref={ref => { this.searchAnimate = ref }}
                autoPlay
                source={require('./../../assets/animations/searchToken.json')}
                loop
                style={{ width: 60, height: 50 }}
              />

              <Utils.VerticalSpacer />
              <Utils.Text size='tiny' font='regular'>
                {this.state.msg}
              </Utils.Text>
            </ModalContainer>
          </Utils.View>
        </Modal>

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

export default Signals
