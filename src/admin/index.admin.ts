import { pool } from '../app/check-db.app'
import { logger } from '../common/utils/log/logger.log'
import { UserModel } from './admin.model'

export const adminUserModel = new UserModel(pool, logger)
