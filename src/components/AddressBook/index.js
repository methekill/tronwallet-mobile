import React, { Component } from 'react'
import { FlatList, Alert, Image } from 'react-native'

import { Container } from '../Utils'
import ActionModal from '../ActionModal'
import AddressCard from './AddressCard'

import getContactStore from '../../store/contacts'
import getSecretsStore from '../../store/secrets'
import { withContext } from '../../store/context'
import tl from '../../utils/i18n'
import { EmptyWrapper, EmptyText } from './elements'

class AddressBook extends Component {
  state = {
    modalVisible: false,
    currentItem: null,
    refreshing: false
  }

  _onRefresh = () => {
    const { reloadData } = this.props

    this.setState({ refreshing: true })
    reloadData()
    this.setState({ refreshing: false })
  }

  _closeModal = () => {
    this.setState({
      modalVisible: false,
      currentItem: null
    })
  }

  _onCardPress = (item) => {
    this.setState({
      modalVisible: true,
      currentItem: item
    })
  }

  _navigate = (to, itemObj) => {
    const { navigation } = this.props

    this._closeModal()
    navigation.navigate(to, itemObj)
  }

  _onEditPress = () => {
    const { currentItem } = this.state

    this._navigate(
      'EditAddressBookItem',
      {
        item: currentItem,
        isUserAccount: this.props.isUserAccount,
        reloadData: this.props.reloadData
      }
    )
  }

  _onSendPress = () => {
    const { currentItem } = this.state

    this._navigate('SendScene', { address: currentItem.address })
  }

  _onDeletePress = () => {
    const { currentItem } = this.state
    const { reloadData, context, isUserAccount } = this.props

    Alert.alert(
      tl.t('addressBook.contacts.delete.title'),
      tl.t('addressBook.contacts.delete.message'),
      [
        {
          text: tl.t('addressBook.contacts.delete.cancelButton'),
          onPress: () => {
            this.setState({
              modalVisible: false,
              currentItem: null
            })
          },
          style: 'cancel'
        },
        {
          text: tl.t('addressBook.contacts.delete.okButton'),
          onPress: async () => {
            const store = isUserAccount ? await getSecretsStore(context.pin) : await getContactStore()
            store.write(() => {
              let item
              if (isUserAccount) {
                item = store.objectForPrimaryKey('Account', currentItem.address)
              } else {
                item = store.objectForPrimaryKey('Contact', currentItem.address)
              }
              store.delete(item)
            })
            reloadData()
            this.setState({
              modalVisible: false,
              currentItem: null
            })
          }
        }
      ]
    )
  }

  _renderCard = ({ item }) => (
    <AddressCard
      item={item}
      onCardPress={() => { this._onCardPress(item) }}
    />
  )

  _renderEmpty = () => {
    return (
      <EmptyWrapper>
        <Image
          source={require('../../assets/empty-contacts.png')}
          resizeMode='contain'
          style={{ width: 200, height: 200 }}
        />
        <EmptyText>
          {tl.t('addressBook.contacts.empty')}
        </EmptyText>
      </EmptyWrapper>
    )
  }

  render () {
    const { modalVisible, refreshing } = this.state
    const { items, children } = this.props

    return (
      <Container style={{position: 'relative'}}>
        <ActionModal
          visible={modalVisible}
          closeModal={this._closeModal}
          animationType='fade'
          actions={[
            {onPress: this._onEditPress, text: tl.t('addressBook.shared.edit')},
            {onPress: this._onDeletePress, text: tl.t('addressBook.shared.delete')},
            {onPress: this._onSendPress, text: tl.t('addressBook.shared.send')}
          ]}
        />
        <FlatList
          keyExtractor={item => item.address}
          data={items}
          refreshing={refreshing}
          onRefresh={this._onRefresh}
          renderItem={this._renderCard}
          ListEmptyComponent={this._renderEmpty}
        />
        {children}
      </Container>
    )
  }
}

export default withContext(AddressBook)
