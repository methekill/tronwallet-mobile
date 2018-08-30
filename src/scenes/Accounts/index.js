import React, { Component } from 'react'

import { withContext } from '../../store/context'

import AddressBook from '../../components/AddressBook'

class Contacts extends Component {
  render () {
    const { navigation } = this.props

    return (
      <AddressBook
        items={this.props.context.accounts}
        navigation={navigation}
        reloadData={this.props.context.loadUserData}
        isUserAccount
      />
    )
  }
}

export default withContext(Contacts)
