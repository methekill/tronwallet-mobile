import React from 'react'
import Swiper from 'react-native-swiper'
import { Image } from 'react-native'

import * as Utils from '../../components/Utils'
import { Colors } from '../../components/DesignSystem'

const FEATURES_IMAGES = [
  {title: 'SECURITY', body: 'Privacy and security for \n your transactions', source: require('../../assets/security.png')},
  {title: 'VOTES', body: 'Freezing and vote for Super \n Representatives', source: require('../../assets/votes.png')},
  {title: 'ADDRESS BOOK', body: 'You can manage multiple accounts \n in your wallet', source: require('../../assets/address-book.png')},
  {title: 'MULTIPLE ACCOUNTS', body: 'You can manage multiple accounts \n in your wallet', source: require('../../assets/multiple-accounts.png')}
]

const featureView = FEATURES_IMAGES.map((feat, index) =>
  <Utils.View key={index} flex={1} align='center' justify='center'>
    <Image style={{width: 150, height: 150}} source={feat.source} />
    <Utils.View height={10} />
    <Utils.Text size='average'>{feat.title}</Utils.Text>
    <Utils.View height={14} />
    <Utils.Text lineHeight={18} size='smaller' align='center' font='regular' color={Colors.greyBlue}>{feat.body}</Utils.Text>
  </Utils.View>)

export default () => (
  <Swiper
    dotColor={'rgba(255,255,255,0.2)'}
    activeDotColor={Colors.primaryText}
    dotStyle={{marginLeft: 6, marginRight: 6}}
    activeDotStyle={{marginLeft: 6, marginRight: 6}}
    paginationStyle={{bottom: 10, justifyContent: 'flex-start', paddingLeft: 35}}
    style={{backgroundColor: Colors.background}}>
    {[
      <Utils.View padding={35} key={4} flex={1} justify='center'>
        <Utils.Text size='large'>Welcome to {'\n'}TRONWALLET</Utils.Text>
        <Utils.View height={14} />
        <Utils.Text size='small' font='regular' color={Colors.greyBlue}>
        The most secure wallet for TRON
        </Utils.Text>
      </Utils.View>,
      ...featureView
    ]}
  </Swiper>
)
