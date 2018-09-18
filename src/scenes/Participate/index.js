import React from 'react'
import { Answers } from 'react-native-fabric'

import {
  TouchableOpacity,
  Image,
  FlatList,
  ActivityIndicator,
  View
} from 'react-native'

import LinearGradient from 'react-native-linear-gradient'
import ProgressBar from 'react-native-progress/Bar'
import moment from 'moment'
import { debounce, union } from 'lodash'

import tl from '../../utils/i18n'
import getAssetsStore from '../../store/assets'
import { Colors } from '../../components/DesignSystem'
import { orderAssets, updateAssets, getCustomName } from '../../utils/assetsUtils'
import { ONE_TRX } from '../../services/client'
import guarantee from '../../assets/guarantee.png'
import NavigationHeader from '../../components/Navigation/Header'
import { logSentry } from '../../utils/sentryUtils'
import { VERIFIED_TOKENS } from '../../utils/constants'

import {
  Container,
  Row
} from '../../components/Utils'

import {
  Card,
  CardContent,
  TokenPrice,
  Featured,
  Text,
  TokenName,
  VerticalSpacer,
  FeaturedText,
  FeaturedTokenName,
  FeaturedTokenPrice,
  HorizontalSpacer,
  BuyButton,
  ButtonText,
  TokensTitle
} from './Elements'
import { rgb } from '../../../node_modules/polished'

const AMOUNT_TO_FETCH = 30

class ParticipateHome extends React.Component {
  static navigationOptions = () => {
    return { header: null }
  }

  state = {
    assetList: [],
    currentList: [],
    featuredTokens: [],
    start: 0,
    loading: false,
    searchMode: false

  }

  async componentDidMount () {
    Answers.logContentView('Tab', 'Participate')
    this._smartSearch = debounce(this._smartSearch, 150)
    await this._getFeaturedTokensFromStore()
    this._loadData()
  }

  _getFeaturedTokensFromStore = async () => {
    const store = await getAssetsStore()
    const filtered = store.objects('Asset')
      .map(item => Object.assign({}, item))
      .filter(item => VERIFIED_TOKENS.includes(item.name))

    if (filtered.length) {
      this.setState({ featuredTokens: orderAssets(filtered) })
    }
  }

  _loadData = async () => {
    this.setState({ loading: true })

    try {
      this.assetStoreRef = await getAssetsStore()
      const assets = await this._updateAssets(0)
      this.setState({ assetList: assets, currentList: assets })
    } catch (e) {
      this.setState({ error: e.message })
      logSentry(e, 'Participate - Load Data')
    } finally {
      this.setState({ loading: false })
    }
  }

  _loadMore = async () => {
    const { start, assetList, searchMode } = this.state

    if (searchMode) return

    this.setState({ loading: true })
    const newStart = start + AMOUNT_TO_FETCH

    try {
      const assets = await this._updateAssets(newStart)
      const updatedAssets = union(assetList, assets)

      this.setState({ start: newStart, assetList: updatedAssets, currentList: updatedAssets })
    } catch (error) {
      this.setState({ error: error.message })
      logSentry(error, 'Participate - Load more candidates')
    } finally {
      this.setState({ loading: false })
    }
  }

  _orderAssetsFromList = assets => assets
    .filter(({ issuedPercentage, name, startTime, endTime }) =>
      issuedPercentage < 100 && name !== 'TRX' && startTime < Date.now() && endTime > Date.now() && !VERIFIED_TOKENS.includes(name))
    .sort((a, b) => b.issuedPercentage - a.issuedPercentage)

  _updateAssets = async (start, end = AMOUNT_TO_FETCH, name) => {
    const assets = await updateAssets(start, end, name)
    return this._orderAssetsFromList(assets)
  }

  _onSearchPressed = () => {
    const { searchMode } = this.state

    this.setState({ searchMode: !searchMode })
    if (searchMode) this._restartFromSearch()
  }

  _smartSearch = async name => {
    const assetResult = this.assetStoreRef.objects('Asset')
      .filtered('name CONTAINS[c] $0', name)
      .map(item => Object.assign({}, item))

    if (assetResult.length) {
      this.setState({ currentList: this._orderAssetsFromList(assetResult) })
    } else {
      this.setState({searching: true})
      try {
        const assetFromApi = await updateAssets(0, 2, name)
        if (assetFromApi.length) {
          this.setState({ currentList: assetFromApi })
        } else {
          this.setState({ currentList: assetFromApi })
        }
      } catch (error) {
        logSentry(error, 'Smart Search Error')
      } finally {
        this.setState({searching: false})
      }
    }
  }
  _restartFromSearch = () => {
    const assets = this.assetStoreRef.objects('Asset')
      .map(item => Object.assign({}, item))
    this.setState({
      currentList: this._orderAssetsFromList(assets.slice(0, AMOUNT_TO_FETCH)),
      start: 0})
  }

  // _onSearch = async (name) => {
  //   const { assetList } = this.state
  //   try {
  //     if (name) {
  //       this.setState({ loading: true })
  //       const assets = await this._updateAssets(0, 10, name)
  //       this.setState({ currentList: assets, loading: false })
  //     } else {
  //       this.setState({ currentList: assetList, loading: false })
  //     }
  //   } catch (error) {
  //     this.setState({ error: error.message })
  //     logSentry(error, 'Participate - on search')
  //   }
  // }

  _renderFeaturedTokens = () => {
    const { searchMode, featuredTokens, searching } = this.state
    if (searchMode) {
      return <View marginVertical={5}>
        {searching && <ActivityIndicator color={Colors.primaryText} />}
      </View>
    }

    return (
      <View>
        <TokensTitle>
          {tl.t('participate.tokens')}
        </TokensTitle>
        <VerticalSpacer size={20} />
        {featuredTokens.map(token => <React.Fragment key={token.name}>{this._renderCard(token)}</React.Fragment>)}
      </View>
    )
  }

  _renderCardContent = ({ name, price, issuedPercentage, endTime, featured, verified }) => (
    <React.Fragment>
      {featured && (
        <Featured>
          <FeaturedText align='center'>{tl.t('participate.featured')}</FeaturedText>
        </Featured>
      )}
      <CardContent>
        <Row justify='space-between' align='center'>
          {verified ? (
            <Row align='center'>
              <HorizontalSpacer size={8} />
              <FeaturedTokenName>{getCustomName(name)}</FeaturedTokenName>
              <HorizontalSpacer size={4} />
              <Image source={guarantee} style={{ height: 14, width: 14 }} />
            </Row>
          ) : (
            <TokenName>{name}</TokenName>
          )}
          {featured ? <FeaturedTokenPrice>{price / ONE_TRX} TRX</FeaturedTokenPrice> : <TokenPrice>{price / ONE_TRX} TRX</TokenPrice>}
        </Row>
        <VerticalSpacer size={featured ? 12 : 20} />
        <Row>
          <View style={{flex: 1, justifyContent: 'center'}}>
            <ProgressBar
              progress={Math.round(issuedPercentage) / 100}
              borderWidth={0}
              width={null} height={4}
              color={rgb(6, 231, 123)}
              unfilledColor={rgb(25, 26, 42)}
            />
            <VerticalSpacer size={6} />
            <Row justify='space-between'>
              <Text>{tl.t('ends')} {moment(endTime).fromNow()}</Text>
              <Text>{Math.round(issuedPercentage)}%</Text>
            </Row>
          </View>
          <HorizontalSpacer size={20} />
          {featured && (
            <BuyButton elevation={8}>
              <ButtonText>{tl.t('participate.button.buyNow')}</ButtonText>
            </BuyButton>
          )}
        </Row>
      </CardContent>
    </React.Fragment>
  )

  _renderCard = (asset) => {
    return (
      <React.Fragment>
        <TouchableOpacity onPress={() => { this.props.navigation.navigate('Buy', { item: asset }) }}>
          <Card>
            {asset.featured ? (
              <LinearGradient
                start={{ x: 0, y: 1 }}
                end={{ x: 1, y: 0 }}
                colors={[rgb(255, 68, 101), rgb(246, 202, 29)]}
                style={{ flex: 1 }}
              >
                {this._renderCardContent(asset)}
              </LinearGradient>
            ) : (
              this._renderCardContent(asset)
            )}
          </Card>
          <VerticalSpacer size={15} />
        </TouchableOpacity>
      </React.Fragment>
    )
  }

  _renderLoading = () => {
    const { loading } = this.state

    if (loading) {
      return (
        <React.Fragment>
          <ActivityIndicator size='small' color={Colors.primaryText} />
          <VerticalSpacer size={10} />
        </React.Fragment>
      )
    }

    return null
  }

 _renderEmptyAssets = () => {
   const { loading, refreshing } = this.state
   if (!loading && !refreshing) {
     return (
       <View style={{flex: 1, padding: 20, justifyContent: 'center', alignItems: 'center'}}>
         <Image
           source={require('../../assets/empty.png')}
           resizeMode='contain'
           style={{ width: 200, height: 200 }}
         />
         <Text style={{fontSize: 14}}>Asset(s) not found</Text>
       </View>
     )
   }
 }

 render () {
   const { currentList } = this.state
   const orderedBalances = orderAssets(currentList)
   return (
     <Container>
       <NavigationHeader
         title={tl.t('participate.title')}
         onSearch={name => this._smartSearch(name)}
         onSearchPressed={() => this._onSearchPressed()}
         searchPreview='Featured Tokens'
       />
       <FlatList
         ListHeaderComponent={this._renderFeaturedTokens()}
         ListFooterComponent={this._renderLoading()}
         ListEmptyComponent={this._renderEmptyAssets()}
         initialNumToRender={10}
         data={orderedBalances}
         renderItem={({ item }) => this._renderCard(item)}
         keyExtractor={asset => asset.name}
         scrollEnabled
         onEndReached={this._loadMore}
         onEndReachedThreshold={0.75}
       />
     </Container>
   )
 }
}

export default ParticipateHome
