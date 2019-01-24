import React, { PureComponent } from 'react'
import { ScrollView } from 'react-native'
import ProgressBar from 'react-native-progress/Bar'
import moment from 'moment'
import Mixpanel from 'react-native-mixpanel'

import NavigationHeader from '../../../components/Navigation/Header'
import { BoldInfoRow, RegularInfoRow, SmallRegInfoRow } from '../../../components/KeyPairInfoRow'
import { WhiteLabelText, PercentageView, DividerSpacer } from '../Elements'
import ButtonGradient from '../../../components/ButtonGradient'
import { Colors } from '../../../components/DesignSystem'
import * as Utils from '../../../components/Utils'
import { ONE_TRX } from '../../../services/client'
import tl from '../../../utils/i18n'
import { replaceRoute } from '../../../utils/navigationUtils'
import { formatNumber } from '../../../utils/numberUtils'

class TokenInfo extends PureComponent {
  static navigationOptions = { header: null }

  _isTokenAvailableToBuy = ({ issuedPercentage, isListed, startTime, endTime }) => {
    const now = new Date().getTime()
    return (issuedPercentage < 100 && isListed && (startTime <= now && endTime >= now))
  }

  _navigateToBuyToken = () => {
    const { navigation } = this.props
    const item = navigation.getParam('item', {})
    const fromBalance = navigation.getParam('fromBalance', false)

    if (fromBalance) {
      replaceRoute(navigation, 'Buy', { item })
    } else {
      navigation.navigate('Buy', { item })
    }

    Mixpanel.trackWithProperties('Navigate to buy token', { token: item.name })
  }

  render () {
    const item = this.props.navigation.getParam('item', {})
    const isTokenAvailableToBuy = this._isTokenAvailableToBuy(item)
    const {
      name,
      price,
      issuedPercentage,
      issued,
      totalSupply,
      startTime,
      endTime,
      description,
      transaction,
      ownerAddress,
      abbr,
      id
    } = item
    return (
      <Utils.SafeAreaView>
        <NavigationHeader
          title={tl.t('participate.tokenInfo')}
          onBack={() => this.props.navigation.goBack()}
        />
        <ScrollView>
          <Utils.Content paddingVertical='small' vertical>
            <Utils.View align='center'>
              <WhiteLabelText label={abbr} />
            </Utils.View>
            <Utils.View flex={1} paddingLeft='medium'>
              <Utils.Text font='bold' size='average'>{name}</Utils.Text>
              <Utils.Text size='tiny'>{id}</Utils.Text>
              <Utils.View paddingY='small'>
                <Utils.SectionTitle small>{tl.t('participate.pricePerToken')}</Utils.SectionTitle>
                <Utils.View height={5} />
                <Utils.Text>{`${price / ONE_TRX} TRX`}</Utils.Text>
              </Utils.View>
              <Utils.Row align='center' justify='space-between'>
                <PercentageView>
                  <Utils.SectionTitle small>{tl.t('participate.percentage')}</Utils.SectionTitle>
                  <Utils.View height={5} />
                  <ProgressBar
                    progress={Math.round(issuedPercentage) / 100}
                    borderWidth={0}
                    height={3}
                    width={180}
                    color={Colors.confirmed}
                    unfilledColor={Colors.dusk}
                  />
                </PercentageView>
                <Utils.BoldText>{Math.round(issuedPercentage)}%</Utils.BoldText>
              </Utils.Row>
              <Utils.View height={8} />
              {isTokenAvailableToBuy && (
                <ButtonGradient
                  text={tl.t('participate.button.buyNow').toUpperCase()}
                  onPress={this._navigateToBuyToken}
                  size='medium'
                  full
                />
              )}
            </Utils.View>
          </Utils.Content>
          <DividerSpacer size='big' marginX='large' />
          <BoldInfoRow
            pairs={[
              { key: tl.t('participate.issued'), value: formatNumber(issued) },
              { key: tl.t('participate.totalSupply'), value: formatNumber(totalSupply) }
            ]}
          />
          <DividerSpacer size='medium' marginX='large' />
          <SmallRegInfoRow
            pairs={[
              { key: tl.t('participate.startTime'), value: moment(startTime).format('DD/MM/YYYY hh:mm A') },
              { key: tl.t('participate.endTime'), value: moment(endTime).format('DD/MM/YYYY hh:mm A') }
            ]}
          />
          <DividerSpacer size='medium' marginX='large' />
          <RegularInfoRow
            pairs={[
              { key: tl.t('participate.description'), value: description }
            ]}
          />
          <DividerSpacer size='medium' marginX='large' />
          <RegularInfoRow
            pairs={[
              { key: tl.t('participate.ownerAddress'), value: ownerAddress }
            ]}
          />
          <DividerSpacer size='medium' marginX='large' />
          <RegularInfoRow
            pairs={[
              { key: tl.t('participate.transaction'), value: transaction }
            ]}
          />
        </ScrollView>
      </Utils.SafeAreaView>
    )
  }
}
export default TokenInfo
