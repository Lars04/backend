import { pool } from '../app/check-db.app'
import { logger } from '../common/utils/log/logger.log'
import { LicenseController } from './license.controller'
import { LicenseModel } from './license.model'
import { LicenseService } from './license.service'

export const licenseModel = new LicenseModel(pool, logger)
export const licenseService = new LicenseService(licenseModel, logger)
export const licenseController = new LicenseController(licenseService, logger)
