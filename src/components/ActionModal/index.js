import React from 'react'
import PropTypes from 'prop-types'
import { View } from 'react-native'

import Modal from '../Modal'
import {
  ContactsModalWrapper,
  ContactsModalCard,
  Divider,
  Action,
  ActionText,
  Title
} from './elements'

import tl from '../../utils/i18n'

const AddressBookModal = ({
  visible,
  closeModal,
  animationType,
  actions
}) => (
  <Modal
    modalOpened={visible}
    closeModal={closeModal}
    animationType={animationType}
    transparent
  >
    <ContactsModalWrapper onPress={closeModal}>
      <ContactsModalCard>
        <Title>{tl.t('general.actionModalTitle')}</Title>
        {actions && actions.map(action => (
          <View key={action.text}>
            <Action onPress={action.onPress}>
              <ActionText>{action.text}</ActionText>
            </Action>
            <Divider />
          </View>
        ))}
      </ContactsModalCard>
    </ContactsModalWrapper>
  </Modal>
)

AddressBookModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  closeModal: PropTypes.func.isRequired,
  animationType: PropTypes.string,
  actions: PropTypes.arrayOf(PropTypes.shape({
    onPress: PropTypes.func.isRequired,
    text: PropTypes.string.isRequired
  })).isRequired
}

export default AddressBookModal
