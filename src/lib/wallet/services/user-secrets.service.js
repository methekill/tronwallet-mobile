class UserServiceService {
  constructor (repo) {
    this._repo = repo
  }

  async updateAccount (account) {
    const foundAccount = this._repo.findByKey(account.address)

    if (!foundAccount) {
      throw new Error('Account not found')
    }

    await this._repo.save(account)
  }
}

export default UserServiceService
