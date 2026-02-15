import type { RequestHandler } from 'express'
import { ApiError } from '../../common/utils/log/exists-error.log'
import { tokenService } from '../index.auth'
import type { IUserJwtPayload } from '../types/token.type'

export const authenticated: RequestHandler = async (req, res, next) => {
	try {
		const authorizationHeader = req.headers.authorization

		if (!authorizationHeader) {
			return next(ApiError.UnauthorizedError())
		}

		const accessToken = authorizationHeader.split(' ')[1]

		if (!accessToken) {
			return next(ApiError.UnauthorizedError())
		}

		const userData = tokenService.validateAccessToken(
			accessToken
		) as IUserJwtPayload

		if (!userData) {
			return next(ApiError.UnauthorizedError())
		}

		// @ts-ignore
		req.user = userData
		next()
	} catch (error) {
		next(ApiError.UnauthorizedError())
	}
}
