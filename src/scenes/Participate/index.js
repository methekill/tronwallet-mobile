import React from 'react'
import { Answers } from 'react-native-fabric'
import { Image, FlatList, ActivityIndicator, Platform, RefreshControl } from 'react-native'
import ProgressBar from 'react-native-progress/Bar'
import moment from 'moment'
import debounce from 'lodash/debounce'
import union from 'lodash/union'
import clamp from 'lodash/clamp'
import MixPanel from 'react-native-mixpanel'

// Design
import NavigationHeader from '../../components/Navigation/Header'
import { View, Container, Row, SafeAreaView } from '../../components/Utils'
import {
  Card,
  TokenPrice,
  Text,
  TextId,
  TokenName,
  VerticalSpacer,
  FeaturedTokenName,
  HorizontalSpacer,
  BuyButton,
  ButtonText,
  GradientCard,
  TokenLabel,
  WhiteLabelText,
  Featured,
  FeaturedText
} from './Elements'
import LoadingScene from '../../components/LoadingScene'
import FontelloIcon from '../../components/FontelloIcon'
import { Colors } from '../../components/DesignSystem'

// Utils
import { getCustomName } from '../../utils/assetsUtils'
import { logSentry } from '../../utils/sentryUtils'
import { withContext } from '../../store/context'
import { ONE_TRX } from '../../services/client'
import tl from '../../utils/i18n'

// Service
import { BATCH_NUMBER, getTokens, queryToken } from '../../services/contentful/general'

class ParticipateHome extends React.Component {
  static navigationOptions = () => ({ header: null })

  state = {
    assetList: [],
    currentList: [],
    featuredTokens: [],
    start: 0,
    loading: true,
    refreshing: false,
    loadingMore: false,
    searchName: '',
    totalTokens: 0,
    error: null,
    isSearching: false
  }

  componentDidMount () {
    Answers.logContentView('Tab', 'Participate')
    this._onSearching = debounce(this._onSearching, 250)
    this._navListener = this.props.navigation.addListener('didFocus', this._loadData)
  }

  componentWillUnmount () {
    this._navListener.remove()
  }

  _loadData = async () => {
    this.setState({ start: 0, isSearching: false })
    try {
      const { assets, featured, totalTokens } = await getTokens()
      this.setState({
        totalTokens,
        assetList: assets,
        featuredTokens: featured,
        currentList: assets
      })
      MixPanel.track('load participate')
    } catch (error) {
      logSentry(error, 'Initial load participate')
      this.setState({ error: error.message })
    } finally {
      this.setState({ loading: false })
    }
  }

  _loadMore = async () => {
    const { start, assetList, isSearching, loading, totalTokens } = this.state
    const newStart = clamp(start + BATCH_NUMBER, totalTokens)

    if (loading || isSearching || newStart === totalTokens) return

    this.setState({ loadingMore: true })
    try {
      const { assets } = await getTokens(newStart)
      const updatedAssets = union(assetList, assets)

      this.setState({
        start: newStart,
        assetList: updatedAssets,
        currentList: updatedAssets
      })
    } catch (error) {
      this.setState({ error: error.message })
      logSentry(error, 'Participate - Load more candidates')
    } finally {
      this.setState({ loadingMore: false })
    }
  }

  _refreshData = async () => {
    this.setState({ refreshing: true, error: null })
    await this._loadData()
    this.setState({ refreshing: false, error: null })
  }

  _filterOrderedAssets = assets =>
    assets.filter(({ issuedPercentage, startTime, endTime }) => issuedPercentage < 100 && startTime < Date.now() && endTime > Date.now())

  _onSearchPressed = () => {
    const { isSearching, assetList } = this.state
    const state = { isSearching: !isSearching, searchName: '' }
    if (isSearching) {
      state.currentList = assetList
    } else {
      state.currentList = []
    }
    this.setState(state)
  }

  _onSearching = name => {
    const { assetList, featuredTokens } = this.state
    const searchValue = name.replace(/^[^a-zA-Z]/g, '')
    const regex = new RegExp(searchValue.toUpperCase(), 'i')
    const resultList = [...featuredTokens, ...assetList].filter(ast => regex.test(ast.name.toUpperCase()))

    this.setState({ searchName: name }, () => {
      MixPanel.trackWithProperties('Search Participate', { name })
      if (resultList.length) {
        const searchedList = name ? resultList : []
        this.setState({ currentList: searchedList })
      } else {
        this._searchFromApi(name)
      }
    })
  }

  _searchFromApi = async name => {
    this.setState({ searching: true })
    try {
      const { results } = await queryToken(name)
      this.setState({ currentList: results })
    } catch (error) {
      logSentry(error, 'Search Participate Error')
    } finally {
      this.setState({ searching: false })
    }
  }

  _navigateToBuyToken = (item) => {
    this.props.navigation.navigate('TokenInfo', { item })
    MixPanel.trackWithProperties('Navigate to Buy token', { token: item.name })
  }

  _renderFeaturedTokens = () => {
    const { isSearching, featuredTokens, searching, searchName } = this.state
    const featTokens = featuredTokens.map(token => (
      <React.Fragment key={token.id}>
        {isSearching
          ? this._renderCardContent(token)
          : this._renderFeaturedCardContent(token)}
      </React.Fragment>
    ))

    if (isSearching) {
      return (
        <View>
          {searching && (
            <View marginBottom={10}>
              <ActivityIndicator color={Colors.primaryText} />
            </View>
          )}
          {!searchName && featTokens}
        </View>
      )
    } else {
      return <View>{featTokens}</View>
    }
  }

  _renderFeaturedCardContent = asset => {
    const { name, abbr, issuedPercentage, endTime, id } = asset
    return (
      <GradientCard>
        <WhiteLabelText label={abbr.toUpperCase()} />
        <HorizontalSpacer size={18} />
        <View flex={1} justify='space-between'>
          <Row align='center'>
            <FeaturedTokenName>{getCustomName(name, id)}</FeaturedTokenName>
            <TextId>#{id}</TextId>
          </Row>
          <VerticalSpacer size={36} />
          <View>
            <ProgressBar
              progress={Math.round(issuedPercentage) / 100}
              borderWidth={0}
              width={null}
              height={4}
              color={Colors.weirdGreen}
              unfilledColor={Colors.dusk}
            />
            <VerticalSpacer size={6} />
            <Row justify='space-between'>
              <Text>{tl.t('ends')} {moment(endTime).fromNow()}</Text>
              <Text>{Math.round(issuedPercentage)}%</Text>
            </Row>
          </View>
        </View>
        <View flex={1} align='flex-end' justify='space-between'>
          <Featured>
            <FeaturedText align='center'>{tl.t('participate.featured')}</FeaturedText>
          </Featured>
          <BuyButton onPress={() => this._navigateToBuyToken(asset)} elevation={4} >
            <ButtonText>{tl.t('buy').toUpperCase()}</ButtonText>
          </BuyButton>
        </View>
      </GradientCard>
    )
  }

  _renderCardContent = asset => {
    const { name, abbr, price, issuedPercentage, endTime, isVerified, id } = asset
    return (
      <Card>
        <TokenLabel label={abbr.toUpperCase()} />
        <HorizontalSpacer size={24} />
        <View flex={1} justify='space-between'>
          {isVerified
            ? (
              <Row align='center'>
                <FeaturedTokenName>{getCustomName(name, id)}</FeaturedTokenName>
                <HorizontalSpacer size={4} />
                <FontelloIcon
                  name='guarantee'
                  style={{ height: 14, width: 14 }}
                  color='#3face7'
                />
              </Row>
            )
            : <Row align='center'>
              <TokenName>{name}</TokenName>
              <TextId>#{id}</TextId>
            </Row>
          }
          <View>
            <ProgressBar
              progress={Math.round(issuedPercentage) / 100}
              borderWidth={0}
              width={null}
              height={4}
              color={Colors.weirdGreen}
              unfilledColor={Colors.dusk}
            />
            <VerticalSpacer size={6} />
            <Row justify='space-between'>
              <Text>
                {tl.t('ends')} {moment(endTime).fromNow()}
              </Text>
              <Text>{Math.round(issuedPercentage)}%</Text>
            </Row>
          </View>
        </View>
        <View flex={1} align='flex-end' justify='space-between'>
          <TokenPrice>{price / ONE_TRX} TRX</TokenPrice>
          <BuyButton onPress={() => this._navigateToBuyToken(asset)} elevation={4} >
            <ButtonText>{tl.t('buy').toUpperCase()}</ButtonText>
          </BuyButton>
        </View>
      </Card>
    )
  }

  _renderLoading = () => {
    const { loadingMore } = this.state
    if (loadingMore) {
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
    const {
      loading,
      isSearching,
      searching,
      searchName,
      currentList,
      error
    } = this.state

    if ((isSearching && !loading && !!searchName & !searching && !currentList.length) || error) {
      return (
        <View flex={1} align='center' justify='center' padding={20}>
          <Image
            source={require('../../assets/empty.png')}
            resizeMode='contain'
            style={{ width: 200, height: 200 }}
          />
          <Text style={{ fontSize: 13 }}>
            {tl.t('participate.error.notFound')}
          </Text>
        </View>
      )
    }
    return null
  }

  _renderSeparator = () => (
    <View
      height={0.5}
      marginLeft={80}
      marginTop={10}
      width='100%'
      background={Colors.greyBlue}
    />
  )

  render () {
    const { currentList, searchName, featuredTokens, isSearching, loading, refreshing } = this.state
    const searchPreview = searchName ? `${tl.t('results')} : ${currentList.length}` : tl.t('participate.searchPreview')
    return (
      <SafeAreaView>
        <NavigationHeader
          title={tl.t('participate.title')}
          isSearching={isSearching}
          onSearch={name => this._onSearching(name)}
          onSearchPressed={() => this._onSearchPressed()}
          searchPreview={searchPreview}
        />
        <Container>
          {loading
            ? (<LoadingScene />)
            : (
              <FlatList
                ListHeaderComponent={this._renderFeaturedTokens}
                ListFooterComponent={this._renderLoading}
                ListEmptyComponent={this._renderEmptyAssets}
                ItemSeparatorComponent={this._renderSeparator}
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={this._refreshData}
                  />
                }
                data={currentList}
                extraData={[featuredTokens]}
                renderItem={({ item }) => this._renderCardContent(item)}
                keyExtractor={asset => asset.name}
                scrollEnabled
                removeClippedSubviews={Platform.OS === 'android'}
                maxToRenderPerBatch={BATCH_NUMBER}
                onEndReached={this._loadMore}
                onEndReachedThreshold={0.5}
              />
            )}
        </Container>
      </SafeAreaView>
    )
  }
}

export default withContext(ParticipateHome)
