import { BasicRepository } from '../../infra-data/basic.repository'

export class UserSecretRepository extends BasicRepository {
  constructor (db) {
    super(db, 'UserSercret')
  }
}
