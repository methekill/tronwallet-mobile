import React from 'react'
import Swiper from 'react-native-swiper'
import { Image } from 'react-native'

import * as Utils from '../../components/Utils'
import { Colors } from '../../components/DesignSystem'

const FEATURES_IMAGES = [
  {title: 'SECURITY', body: 'Privacy and security for \n your transactions', source: require('../../assets/security.png')},
  {title: 'VOTES', body: 'Freezing and vote for \n Super Representatives', source: require('../../assets/votes.png')},
  {title: 'ADDRESS BOOK', body: 'You can manage multiple accounts \n in your wallet', source: require('../../assets/address-book.png')},
  {title: 'MULTIPLE ACCOUNTS', body: 'You can manage multiple accounts \n in your wallet', source: require('../../assets/multiple-accounts.png')}]

const featureView = FEATURES_IMAGES.map((feat, index) =>
  <Utils.View key={index} flex={1} align='center' justify='center'>
    <Image style={{width: 150, height: 150}} source={feat.source} />
    <Utils.View height={10} />
    <Utils.Text size='average'>{feat.title}</Utils.Text>
    <Utils.View height={14} />
    <Utils.Text numberOfLines={2} size='xsmall' align='center' font='regular' color={Colors.greyBlue}>{feat.body}</Utils.Text>
  </Utils.View>)

const tronwalletView = <Utils.View index={7} flex={1} align='center' justify='center'>
  <Utils.Text>Welcome to {'\n'} TronWallet</Utils.Text>
  <Utils.View height={14} />
  <Utils.Text numberOfLines={2} size='xsmall' align='center' font='regular' color={Colors.greyBlue}>
   The most secure wallet for TRON
  </Utils.Text>
</Utils.View>
export default () => (
  <Swiper
    dotColor='gray'
    activeDotColor={Colors.primaryText}
    height={100}
    style={{backgroundColor: 'blue'}}>
    {[tronwalletView, ...featureView]}
  </Swiper>
)
