import { adminUserModel } from '../admin/index.admin'
import { pool } from '../app/check-db.app'
import { logger } from '../common/utils/log/logger.log'
import { AuthController } from './auth.controller'
import { AuthModel } from './auth.model'
import { AuthService } from './auth.service'
import { EmailService } from './mail/email.service'
import { SessionModel } from './token/token.model'
import { SessionService } from './token/token.service'

// Tokens
export const tokenModel = new SessionModel(pool)
export const tokenService = new SessionService(tokenModel, logger)
// Auth Model
export const authModel = new AuthModel(pool, logger)
// Auth Service
export const authService = new AuthService(
	authModel,
	tokenService,
	adminUserModel,
	logger
)
// Email
export const authEmailService = new EmailService(logger, authModel)
// Controller
export const authController = new AuthController(
	authService,
	authEmailService,
	logger
)
