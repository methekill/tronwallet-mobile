import React from 'react'
import { SafeAreaView } from 'react-native'
import QRCodeScanner from 'react-native-qrcode-scanner'
import PropTypes from 'prop-types'

import { Colors } from '../components/DesignSystem'
import NavigationHeader from '../components/Navigation/Header'
import tl from '../utils/i18n'
import * as Utils from '../components/Utils'

const QRCodeComponent = ({ onRead, onClose }) => (
  <Utils.Container>
    <SafeAreaView style={{ backgroundColor: Colors.background, flex: 1 }}>
      <NavigationHeader
        title={tl.t('components.QRScanner.title')}
        onBack={onClose}
      />
      <QRCodeScanner
        showMarker
        fadeIn
        customMarker={
          <Utils.View
            flex={1}
            background='transparent'
            justify='center'
            align='center'
          >
            <Utils.View
              width={250}
              height={250}
              borderWidth={2}
              borderColor={'white'}
            />
            <Utils.Text marginTop='medium' align='center'>
              {tl.t('components.QRScanner.explanation')}
            </Utils.Text>
          </Utils.View>
        }
        cameraStyle={{
          height: '100%',
          width: '100%',
          justifyContent: 'flex-start'
        }}
        permissionDialogMessage={tl.t('components.QRScanner.permissionMessage')}
        onRead={onRead}
      />
    </SafeAreaView>
  </Utils.Container>
)

QRCodeComponent.propTypes = {
  onRead: PropTypes.func.isRequired
}

export default QRCodeComponent
