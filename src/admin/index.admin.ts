import { pool } from '../app/check-db.app'
import { logger } from '../common/utils/log/logger.log'
import { AdminController } from './admin.controller'
import { AdminModel } from './admin.model'
import { AdminService } from './admin.service'

export const adminUserModel = new AdminModel(pool, logger)
export const adminUserService = new AdminService(adminUserModel, logger)
export const adminUserController = new AdminController(adminUserService, logger)
