import React, { Component } from 'react'

import AddressBook from '../../components/AddressBook'

export default class Contacts extends Component {
  state = {
    accounts: []
  }

  render () {
    const { accounts } = this.state
    const { navigation } = this.props

    return (
      <AddressBook items={accounts} navigation={navigation} />
    )
  }
}
