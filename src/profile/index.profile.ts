import { pool } from '../app/check-db.app'
import { logger } from '../common/utils/log/logger.log'
import { ProfileController } from './profile.controller'
import { ProfileModel } from './profile.model'
import { ProfileService } from './profile.service'

const profileModel = new ProfileModel(pool, logger)
const profileService = new ProfileService(profileModel, logger)
export const profileController = new ProfileController(profileService, logger)
