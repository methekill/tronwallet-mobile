import React, { Component } from 'react'
import { FlatList, Alert } from 'react-native'
import styled from 'styled-components'

import { Container } from '../Utils'
import AddressModal from './AddressModal'
import AddressCard from './AddressCard'

import getContactStore from '../../store/contacts'
import tl from '../../utils/i18n'

export default class Contacts extends Component {
  state = {
    modalVisible: false,
    currentItem: null,
    refreshing: false
  }

  _onRefresh = () => {
    const { reloadData } = this.props

    this.setState({refreshing: true})
    reloadData()
    this.setState({refreshing: false})
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

    this._navigate('EditAddressBookItem', { item: currentItem })
  }

  _onSendPress = () => {
    const { currentItem } = this.state

    this._navigate('SendScene', { address: currentItem.address })
  }

  _onDeletePress = () => {
    const { currentItem } = this.state
    const { reloadData } = this.props

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
            const store = await getContactStore()
            try {
              store.write(() => {
                let contact = store.objectForPrimaryKey('Contact', currentItem.address)
                store.delete(contact)
                reloadData()
                this.setState({
                  modalVisible: false,
                  currentItem: null
                })
              })
            } catch (e) {
              console.log('There was a problem deleting this contact.')
            }
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
    const TemporaryEmptyComponent = styled.Text`
      font-family: Rubik-Regular;
      font-size: 16px;
      padding: 40px;
      color: white;
    `
    return (
      <TemporaryEmptyComponent>{tl.t('addressBook.contacts.empty')}</TemporaryEmptyComponent>
    )
  }

  render () {
    const { modalVisible, refreshing } = this.state
    const { items, children } = this.props

    return (
      <Container style={{position: 'relative'}}>
        <AddressModal
          visible={modalVisible}
          closeModal={this._closeModal}
          animationType='fade'
          onPressEdit={this._onEditPress}
          onPressSend={this._onSendPress}
          onPressDelete={this._onDeletePress}
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
