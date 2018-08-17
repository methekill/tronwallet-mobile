import React, { Component } from 'react'
import { Alert } from 'react-native'

import NavigationHeader from '../../components/Navigation/Header'
import AddressForm from '../../components/AddressBook/AddressForm'
import ClearButton from '../../components/ClearButton'

import getContactStore from '../../store/contacts'
import { EDIT } from '../../utils/constants'
import tl from '../../utils/i18n'

export default class EditContact extends Component {
  static navigationOptions = ({navigation}) => {
    const { address } = navigation.getParam('item', {})
    return ({
      header: <NavigationHeader title={tl.t('addressBook.shared.edit')} onBack={() => navigation.goBack()} rightButton={(
        <ClearButton onPress={() => {
          Alert.alert(
            tl.t('addressBook.contacts.delete.title'),
            tl.t('addressBook.contacts.delete.message'),
            [
              {
                text: tl.t('addressBook.contacts.delete.cancelButton'),
                onPress: null,
                style: 'cancel'
              },
              {
                text: tl.t('addressBook.contacts.delete.okButton'),
                onPress: async () => {
                  const store = await getContactStore()
                  try {
                    store.write(() => {
                      let contact = store.objectForPrimaryKey('Contact', address)
                      store.delete(contact)
                    })
                    navigation.goBack()
                  } catch (e) {
                    console.log('There was a problem deleting this contact.')
                  }
                }
              }
            ]
          )
        }} />
      )} />
    })
  }

  state = {
    contact: this.props.navigation.getParam('item', {})
  }

  render () {
    const { contact } = this.state
    const { navigation } = this.props

    return (
      contact.address ? (
        <AddressForm
          name={contact.name}
          address={contact.address}
          navigation={navigation}
          type={EDIT}
        />
      ) : null
    )
  }
}
