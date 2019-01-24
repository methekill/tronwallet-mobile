import React, { Component } from 'react'
import { Alert } from 'react-native'
import MixPanel from 'react-native-mixpanel'

import NavigationHeader from '../../components/Navigation/Header'
import AddressForm from '../../components/AddressBook/AddressForm'
import ClearButton from '../../components/ClearButton'
import * as Utils from './../../components/Utils'

import getContactStore from '../../store/contacts'
import getSecretsStore from '../../store/secrets'
import { EDIT } from '../../utils/constants'
import { withContext } from '../../store/context'
import tl from '../../utils/i18n'
import { logSentry } from '../../utils/sentryUtils'

class EditContact extends Component {
  static navigationOptions = {
    header: null
  }

  state = {
    contact: this.props.navigation.getParam('item', {})
  }

  onDelete = async () => {
    const { navigation, context } = this.props
    const { address } = navigation.getParam('item', {})
    const isUserAccount = navigation.getParam('isUserAccount', false)

    const store = isUserAccount ? await getSecretsStore(context.pin) : await getContactStore()
    try {
      store.write(() => {
        let item
        if (isUserAccount) {
          item = store.objectForPrimaryKey('UserSecret', address)
        } else {
          item = store.objectForPrimaryKey('Contact', address)
        }
        store.delete(item)
        MixPanel.track('Delete Address')
        if (isUserAccount) {
          context.loadUserData()
        }
      })
      navigation.goBack()
    } catch (e) {
      logSentry(e, 'Contacts - Edit Address')
    }
  }

  render () {
    const { contact } = this.state
    const { navigation } = this.props
    const isUserAccount = navigation.getParam('isUserAccount', false)

    return (
      <Utils.SafeAreaView>
        <React.Fragment>
          <NavigationHeader
            title={tl.t('addressBook.shared.edit')}
            onBack={() => navigation.goBack()}
            rightButton={
              isUserAccount ? null : (
                <ClearButton
                  onPress={() => {
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
                          onPress: this.onDelete
                        }
                      ]
                    )
                  }}
                />
              )
            }
          />
          {!!contact.address && (
            <AddressForm
              name={contact.name}
              address={contact.address}
              navigation={navigation}
              type={EDIT}
            />
          )}
        </React.Fragment>
      </Utils.SafeAreaView>
    )
  }
}

export default withContext(EditContact)
