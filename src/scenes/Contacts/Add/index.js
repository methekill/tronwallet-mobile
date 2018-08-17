import React, { Component } from 'react'

import NavigationHeader from '../../../components/Navigation/Header'
import AddressForm from '../../../components/AddressBook/AddressForm'

import { ADD } from '../../../utils/constants'
import tl from '../../../utils/i18n'

export default class EditContact extends Component {
  static navigationOptions = ({navigation}) => ({
    header: <NavigationHeader title={tl.t('addressBook.contacts.addContact')} onBack={() => navigation.goBack()} />
  })

  render () {
    const { navigation } = this.props

    return (
      <AddressForm
        navigation={navigation}
        type={ADD}
      />
    )
  }
}
