import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import type { Logger } from 'winston'
import { BaseConfig } from '../../common/abstract/base-config.common'
import { isRequestUserDataApp } from '../../common/utils/app/checkType.utils'
import { setDateUtil } from '../../common/utils/app/date.util'
import { ApiError } from '../../common/utils/log/exists-error.log'
import type { TypeAuthUserService } from '../types/auth.type'
import type {
	IAccessTokenService,
	IUserJwtPayload,
	TokenReturningType,
	ValidateTokenType,
} from '../types/token.type'
import type { SessionModel } from './token.model'

export class SessionService extends BaseConfig {
	constructor(private sessionModel: SessionModel, private logger: Logger) {
		super()
	}

	async generateToken(
		payload: Partial<IUserJwtPayload>
	): Promise<IAccessTokenService | ApiError> {
		if (!this.accessSecretKey || !this.refreshSecretKey)
			return ApiError.InternalServer('JWT secrets tokens is not defend')

		if (
			!this.accessExpire ||
			!this.refreshExpire ||
			!this.accessExpireUnitCase ||
			!this.refreshExpireUnitCase
		)
			return ApiError.InternalServer('JWT expire is not defend')

		// @ts-ignore
		const access = jwt.sign(payload, this.accessSecretKey, {
			expiresIn: `${this.accessExpire}${this.accessExpireUnitCase}`,
			algorithm: 'HS256',
		})
		// @ts-ignore
		const refresh = jwt.sign(payload, this.refreshSecretKey, {
			expiresIn: `${this.refreshExpire}${this.refreshExpireUnitCase}`,
			algorithm: 'HS256',
		})

		return {
			access,
			refresh,
		}
	}

	validateAccessToken(token: string): ValidateTokenType {
		try {
			if (!this.accessSecretKey) {
				return ApiError.BadRequest('У токена нет секретного ключа')
			}

			const userData = jwt.verify(token, this.accessSecretKey)

			return userData
		} catch (error) {
			return null
		}
	}

	validateRefreshToken(token: string): ValidateTokenType {
		try {
			if (!this.refreshSecretKey) {
				return ApiError.BadRequest('У токена нет секретного ключа')
			}

			const userData = jwt.verify(token, this.refreshSecretKey)
			return userData
		} catch (error) {
			return null
		}
	}

	async saveToken(userId: string, refreshToken: string, expireToken: Date) {
		const hashToken = await bcrypt.hash(refreshToken, 10)
		const existsToken = await this.sessionModel.findOne(userId)
		const token = await this.sessionModel.save(
			userId,
			existsToken,
			refreshToken,
			hashToken,
			expireToken
		)

		if (!token) {
			this.logger.error(`Error save token to user-id: ${userId}`)

			return { message: `Do not save session for user-id: ${userId}` }
		}

		return token
	}

	async refreshToken(refreshToken: string): TypeAuthUserService {
		if (!this.refreshExpire)
			return ApiError.InternalServer('Not set max age refresh-token!')

		const isVerifyToken = this.validateRefreshToken(refreshToken)

		if (
			typeof isVerifyToken === 'object' &&
			isVerifyToken !== null &&
			'message' in isVerifyToken
		)
			return ApiError.BadRequest(isVerifyToken.message)

		if (!isRequestUserDataApp(isVerifyToken))
			return ApiError.BadRequest(
				'User-data not founded from refreshToken-isVerifyToken'
			)

		if (!isVerifyToken.sub || typeof isVerifyToken.role === 'undefined')
			return ApiError.BadRequest('ID or Role is not have from verify token')

		const tokens = await this.generateToken({
			sub: isVerifyToken.sub,
			role: Number(isVerifyToken.role),
		})

		if (typeof tokens === 'object' && 'message' in tokens)
			return ApiError.BadRequest(tokens.message, tokens.status)

		const expireRefreshTokenAt = setDateUtil(Number(this.refreshExpire))
		await this.saveToken(
			isVerifyToken.sub,
			tokens.refresh,
			expireRefreshTokenAt
		)

		return {
			accessToken: tokens.access,
			refreshToken: tokens.refresh,
			expireRefreshTokenAt,
		}
	}

	async removeToken(
		userId: string,
		refreshToken: string
	): Promise<TokenReturningType> {
		const tokenData = await this.sessionModel.delete(userId, refreshToken)

		return tokenData
	}
}
