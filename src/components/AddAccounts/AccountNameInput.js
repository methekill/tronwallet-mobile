import React, { PureComponent, Fragment } from 'react'
import { string, number, func } from 'prop-types'

import { isNameValid, isAliasUnique } from '../../utils/validations'
import { formatAlias } from '../../utils/contactUtils'
import tl from '../../utils/i18n'

import Input from '../Input'
import { Colors } from '../DesignSystem'
import { ErrorText } from '../AddressBook/AddressForm/elements'

class AccountNameInput extends PureComponent {
  static propTypes = {
    pin: string.isRequired,
    totalAccounts: number.isRequired,
    onChangeText: func
  }

  static defaultProps = {
    onChangeText: () => {}
  }

  state = {
    accountName: '',
    accountNameError: null
  }

  static getDerivedStateFromProps (props, state) {
    const { totalAccounts } = props

    if (state.prevTotalAccounts !== totalAccounts) {
      const accountName = `Account ${totalAccounts}`

      return {
        accountName,
        prevTotalAccounts: totalAccounts
      }
    }

    return null
  }

  _validateAccountName = async name => {
    if (name) {
      if (!isNameValid(name)) {
        return tl.t('addressBook.form.nameError')
      }

      const aliasIsUnique = await isAliasUnique(formatAlias(name), this.props.pin)
      if (!aliasIsUnique) {
        return tl.t('addressBook.form.uniqueAliasError')
      }
    }

    return null
  }

  _handleAccountNameChange = async accountName => {
    const accountNameError = await this._validateAccountName(accountName)

    this.setState({ accountName, accountNameError })
    this.props.onChangeText(accountName, accountNameError)
  }

  render () {
    const { accountName, accountNameError } = this.state

    return (
      <Fragment>
        <Input
          label={tl.t('addressBook.form.name')}
          value={accountName}
          onChangeText={this._handleAccountNameChange}
          placeholder={tl.t('newAccount.placeholder')}
          labelWrapperColor={Colors.dusk}
        />
        {!!accountNameError && (<ErrorText>{accountNameError}</ErrorText>)}
      </Fragment>
    )
  }
}

export default AccountNameInput
