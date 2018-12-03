import UserSecretRepositoryMock from '../__mocks__/user-secrets.repository.mock'
import UserServiceService from '../services/user-secrets.service'

describe('User secret service', () => {
  let service, repo

  beforeAll(() => {
    repo = new UserSecretRepositoryMock([
      { address: 'asdf1234', alias: 'asdf' },
      { address: 'fdsa4321', alias: 'fdsa' }
    ])

    service = new UserServiceService(repo)
  })

  test('should update account when address exist', async () => {
    const account = { address: 'asdf1234', alias: 'qwer' }
    await service.updateAccount(account)

    const object = repo.findByKey('asdf1234')

    expect(object).toMatchObject({ address: 'asdf1234', alias: 'qwer' })
  })
})
