import React from 'react'
import { Image, StyleSheet } from 'react-native'

import ButtonIconGradient from '../../components/ButtonIconGradient'

import * as Utils from '../../components/Utils'
import tl from '../../utils/i18n'

const ICON_SIZE = 22

const BalanceNavigation = ({ navigation }) => {
  const navigateNext = next => navigation.navigate(next, {index: 0})

  return (
    <React.Fragment>
      <Utils.VerticalSpacer size='xsmall' />
      <Utils.Row>
        <ButtonIconGradient
          text={tl.t('makePayment.pay').toUpperCase()}
          icon={<Image
            source={require('../../assets/icon-scan.png')}
            style={styles.icon}
          />}
          full
          onPress={() => navigateNext('ScanPayScene')}
        />
        <ButtonIconGradient
          text={tl.t('send.title').toUpperCase()}
          full
          icon={<Image
            source={require('../../assets/icon-send.png')}
            style={styles.icon}
          />}
          onPress={() => navigateNext('SendScene')}
        />
        <ButtonIconGradient
          text={tl.t('receive.title').toUpperCase()}
          full
          icon={<Image
            source={require('../../assets/icon-qrcode.png')}
            style={styles.icon}
          />}
          onPress={() => navigateNext('PaymentsScene')}
        />
        <ButtonIconGradient
          text={tl.t('freeze.title').toUpperCase()}
          multiColumnButton={{x: 2, y: 3}}
          full
          icon={<Image
            source={require('../../assets/icon-freeze.png')}
            style={styles.icon}
          />}
          onPress={() => navigateNext('FreezeScene')}
        />
      </Utils.Row>
    </React.Fragment>
  )
}

const styles = StyleSheet.create({
  icon: {
    height: ICON_SIZE,
    width: ICON_SIZE
  }
})

export default BalanceNavigation
