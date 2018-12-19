import React from 'react'
import { Dimensions } from 'react-native'
import Switch from 'react-native-switch-pro'
import Modal from 'react-native-modal'
import PropTypes from 'prop-types'

import { Colors } from '../../../components/DesignSystem'
import { ModalContainer } from '../elements'

import tl from '../../../utils/i18n'
import * as Utils from '../../../components/Utils'

const { width: DEVICE_WIDTH, height: DEVICE_HEIGHT } = Dimensions.get('window')

// TO-DO : If use this modal again, export it to a General component
const ActionModal = ({isVisible, onClose, toggleLock, locked}) => (
  <Modal
    isVisible={isVisible}
    avoidKeyboard
    useNativeDriver
    onBackdropPress={onClose}
    style={{alignItems: 'center', justifyContent: 'flex-start'}}>
    <ModalContainer
      marginTop={DEVICE_HEIGHT * 0.2}
      width={DEVICE_WIDTH * 0.9}>

      <Utils.Text align='center' size='xsmall' color={Colors.greyBlue}>{tl.t('security')}</Utils.Text>
      <Utils.VerticalSpacer size='large' />

      <Utils.Row align='center' justify='center'>
        <Switch
          circleStyle={{ backgroundColor: Colors.orange }}
          backgroundActive={Colors.yellow}
          backgroundInactive={Colors.secondaryText}
          value={locked}
          onSyncPress={toggleLock}
        />
        <Utils.View width={12} />
        <Utils.Text size='tiny' color={Colors.greyBlue}>{tl.t('exchange.askPin')}</Utils.Text>
      </Utils.Row>

    </ModalContainer>
  </Modal>
)

ActionModal.propTypes = {
  isVisible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  toggleLock: PropTypes.func,
  locked: PropTypes.bool
}
export default ActionModal
