import React, { Component } from 'react'
import { TouchableOpacity, StyleSheet, FlatList, AsyncStorage } from 'react-native'
import { withNavigation } from 'react-navigation'
import LottieView from 'lottie-react-native'
import Feather from 'react-native-vector-icons/Feather'
import Modal from 'react-native-modal'
import get from 'lodash/get'
import unionBy from 'lodash/unionBy'
import MixPanel from 'react-native-mixpanel'

// Design
import { Colors } from '../../components/DesignSystem'
import Badge from '../../components/Badge'
import * as Utils from '../../components/Utils'

// Utils
import tl from '../../utils/i18n'
import { formatNumber } from '../../utils/numberUtils'
import { orderBalances, parseFixedTokens } from '../../utils/balanceUtils'
import { getCustomName } from '../../utils/assetsUtils'
import { USER_FILTERED_TOKENS, WALLET_TOKENS } from '../../utils/constants'
import { logSentry } from '../../utils/sentryUtils'
import { withContext } from '../../store/context'
import { queryToken } from '../../services/contentful/general'

class WalletBalances extends Component {
  state = {
    modalTokenVisible: false,
    errorToken: null,
    list: []
  }

  async componentDidUpdate (prevProps) {
    const { balances, publicKey, fixedTokens } = this.props.context
    const { context: prevContext } = prevProps

    if (balances[publicKey] && (balances[publicKey] !== prevContext.balances[prevContext.publicKey])) {
      try {
        const parsedTokens = parseFixedTokens(WALLET_TOKENS)
        const selectedBalances = this._updateTRXBalance(balances[publicKey].slice(0))
        const tokens = unionBy(selectedBalances, parsedTokens, 'name')
        const list = await this._updateListByStoreTokens(tokens)
        this.setState({
          list: orderBalances(list, fixedTokens)
        })
      } catch (e) {
        logSentry(e, 'WalletBalances - Update Data')
      }
    }
  }

  componentWillUnmount () {
    if (this.searchAnimate) {
      this.searchAnimate.reset()
    }
  }

  _updateListByStoreTokens = (list) => {
    return AsyncStorage.getItem(USER_FILTERED_TOKENS).then(tokens => {
      const filteredTokens = JSON.parse(tokens)
      return list.filter(item => {
        return filteredTokens.indexOf(item.name) === -1
      })
    })
  }

  _updateTRXBalance = (list) => {
    const { publicKey, freeze } = this.props.context
    const total = get(freeze, [publicKey, 'total'], 0)
    return list.map(item => {
      if (item.name === 'TRX') {
        return { ...item, balance: total + item.balance }
      }
      return item
    })
  }

  _navigateToTokenDetails = (item) => {
    this.props.navigation.navigate('TokenDetailScene', { item, fromBalance: true })
  }

  _onItemPress = ({ name: tokenName }) => {
    this.setState({ modalTokenVisible: true, errorToken: null }, async () => {
      try {
        const customParams = {
          content_type: 'asset',
          order: '-fields.isFeatured,-fields.isVerified,fields.position'
        }
        const { results } = await queryToken(false, tokenName, customParams)
        if (results.length) {
          this.setState({ modalTokenVisible: false, errorToken: null }, () => {
            this._navigateToTokenDetails(results[0])
            MixPanel.trackWithProperties('Account Operation', { type: 'Navigate to Token Info', token: tokenName })
          })
        } else {
          this.setState({ errorToken: tl.t('balanceToken.notAvailable') })
        }
      } catch (error) {
        logSentry(error, 'Navigate to Token Info')
        this.setState({ modalTokenVisible: false })
      }
    })
  }

  renderModalToken = () => (
    <Modal isVisible={this.state.modalTokenVisible} animationIn='fadeInDown' animationOut='fadeOutUp'>
      <Utils.View flex={1} align='center' justify='center'>
        <Utils.View align='center' justify='center' style={styles.modalContainer}>
          <TouchableOpacity style={styles.closeModal} onPress={() => this.setState({ modalTokenVisible: false })}>
            <Feather name='x' color='white' size={16} />
          </TouchableOpacity>
          {this.state.modalTokenVisible && (
            <LottieView
              ref={ref => { this.searchAnimate = ref }}
              autoPlay
              source={require('../../assets/animations/searchToken.json')}
              loop={!!this.state.errorToken}
              style={styles.lottie}
            />
          )}
          <Utils.VerticalSpacer />
          <Utils.Text size='tiny' font='regular'>
            {this.state.errorToken || tl.t('balanceToken.updating')}
          </Utils.Text>
        </Utils.View>
      </Utils.View>
    </Modal>
  )

  renderItem = ({ item }) => (
    <Utils.Content key={item.name} paddingHorizontal='none' paddingVertical='medium'>
      <TouchableOpacity disabled={item.name === 'TRX'} onPress={() => this._onItemPress(item)}>
        <Utils.Row justify='space-between'>
          <Badge bg={Colors.lightestBackground} guarantee={item.verified}>{getCustomName(item.name)}</Badge>
          <Utils.Text>{formatNumber(item.balance)}</Utils.Text>
        </Utils.Row>
      </TouchableOpacity>
    </Utils.Content>
  )

  render () {
    return (
      <React.Fragment>
        <Utils.VerticalSpacer size='large' />
        <Utils.Row justify='space-between'>
          <Utils.Text size='xsmall' secondary>{tl.t('balance.tokens')}</Utils.Text>
          <Utils.Text size='xsmall' secondary>{tl.t('balance.holdings')}</Utils.Text>
        </Utils.Row>
        <Utils.VerticalSpacer size='big' />
        <FlatList
          data={this.state.list}
          renderItem={this.renderItem}
          keyExtractor={(item, index) => item.name}
        />
        {this.renderModalToken()}
      </React.Fragment>
    )
  }
}

const styles = StyleSheet.create({
  modalContainer: {
    padding: 15,
    borderColor: Colors.primaryText,
    borderRadius: 5,
    maxWidth: 200,
    minWidth: 120,
    backgroundColor: Colors.background
  },
  closeModal: {
    position: 'absolute',
    right: 10,
    top: 10
  },
  lottie: {
    width: 50,
    height: 50
  }
})

export default withContext(
  withNavigation(WalletBalances)
)
