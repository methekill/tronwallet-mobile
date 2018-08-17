import React from 'react'
import { Dimensions } from 'react-native'
import RNQRCode from 'react-native-qrcode'
import Modal from 'react-native-modal'

// Design
import LinearGradient from 'react-native-linear-gradient'
import { DarkButton } from '../elements'
import * as Utils from '../../../components/Utils'
import { Colors } from '../../../components/DesignSystem'

// Utils
import { formatFloat, formatNumber } from '../../../utils/numberUtils'
import tl from '../../../utils/i18n'

const { width, height } = Dimensions.get('window')

export default ({visible, qrData, onClose, amount, amountTrx, currency}) => {
  return (
    <Modal
      isVisible={visible}
      avoidKeyboard
      useNativeDriver
      onRequestClose={onClose}
      style={{alignItems: 'center'}}
    >
      <LinearGradient
        start={{ x: 1, y: 0 }}
        end={{ x: 1, y: 1 }}
        colors={[Colors.primaryGradient[0], Colors.primaryGradient[1]]}
        style={{
          minWidth: width * 0.8,
          minHeight: height * 0.60,
          alignItems: 'center',
          borderRadius: 3,
          padding: 20}}
      >
        <Utils.Text letterSpacing={0.8} size='xsmall' color={Colors.lighterBackground}>{tl.t('requestPayment.title')}</Utils.Text>
        <Utils.VerticalSpacer size='small' />
        <Utils.Text size='medium'>{formatFloat(amount)} {currency}</Utils.Text>
        {currency !== 'TRX' && <Utils.Text size='tiny'>{formatNumber(amountTrx, true)} TRX</Utils.Text>}
        <Utils.VerticalSpacer size='medium' />
        <Utils.View padding={5} background={Colors.primaryText} borderRadius={3}>
          <RNQRCode
            value={qrData}
            size={250}
            bgColor='black'
            fgColor={Colors.primaryText}
          />
        </Utils.View>

        <Utils.VerticalSpacer size='medium' />
        <DarkButton onPress={onClose}>
          <Utils.Text size='tiny' letterSpacing={0.9}>{tl.t('close').toUpperCase()}</Utils.Text>
        </DarkButton>
      </LinearGradient>
    </Modal>
  )
}
