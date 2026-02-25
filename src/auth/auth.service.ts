import bcrypt from 'bcrypt'
import { v4 as uuidV4 } from 'uuid'
import type { Logger } from 'winston'

import type { AdminModel } from '../admin/admin.model'
import type { IUser } from '../app/db/types/user.types'
import { BaseConfig } from '../common/abstract/base-config.common'
import { APP_CONFIG } from '../common/config/app.config'
import {
	activationLinkHandler,
	genLinks,
} from '../common/constants/link.constant'
import { isRequestUserDataApp } from '../common/utils/app/checkType.utils'
import {
	setDateUtil,
	setHoursUtil,
	setMinuteUtil,
} from '../common/utils/app/date.util'
import { renderSendActivationLink } from '../common/utils/format/render.util'
import { ApiError } from '../common/utils/log/exists-error.log'
import type { AuthModel } from './auth.model'
import { UserDto } from './dto/user.dto'
import { authEmailService } from './index.auth'
import type { SessionService } from './token/token.service'
import type {
	IAuthUserService,
	TypeAuthServiceMessageWithApiError,
	TypeAuthUserService,
} from './types/auth.type'
import type { ForgetDto, LoginDto, RegistrationDto } from './types/dto.types'

export class AuthService extends BaseConfig {
	constructor(
		private model: AuthModel,
		private tokenService: SessionService,
		private userModel: AdminModel,
		private logger: Logger
	) {
		super()
	}

	async login(dto: LoginDto): TypeAuthUserService {
		if (!this.refreshExpire)
			return ApiError.InternalServer('JWT refresh-expire is not defend')

		let user: IUser | null | undefined
		if (dto.email) {
			user = await this.model.getUserByEmail(dto.email)
		} else if (dto.phone) {
			user = await this.model.getUserByPhone(dto.phone)
		}

		if (!user || !user.id) return { message: 'User not founded', status: 404 }

		const isPassEquals = await bcrypt.compare(
			String(dto.password),
			user.password
		)

		if (!isPassEquals) return { message: 'Password is not right', status: 400 }

		const userDto = new UserDto(user)

		if (typeof userDto.isVerify !== 'undefined' && !userDto.isVerify)
			return {
				message: 'User is account is not verify',
				status: 400,
			}

		if (
			!userDto.id ||
			typeof userDto.role === 'undefined' ||
			userDto.role === null
		)
			return {
				message: 'Bad-request user dto from login-email',
				status: 500,
			}

		const tokens = await this.tokenService.generateToken({
			sub: userDto.id,
			role: Number(userDto.role),
		})

		if (typeof tokens === 'object' && 'message' in tokens)
			return {
				message: tokens.message,
				status: 500,
			}

		const expireRefreshTokenAt = setDateUtil(Number(this.refreshExpire))
		await this.tokenService.saveToken(
			userDto.id,
			tokens.refresh,
			expireRefreshTokenAt
		)

		return {
			user: userDto,
			accessToken: tokens.access,
			refreshToken: tokens.refresh,
			expireRefreshTokenAt,
		}
	}

	async registration(dto: RegistrationDto): TypeAuthUserService {
		const now = new Date()
		const isTimeCheck =
			this.expiresVerify !== null &&
			now.getTime() >= this.expiresVerify.getTime()
		const isExpireVerifyMessage = !isTimeCheck || this.expiresVerify === null
		// Remove user
		const isTimeRemoveCheck =
			this.expiresRemoveVerify !== null &&
			now.getTime() >= this.expiresRemoveVerify.getTime()
		const isRemoveExpireVerifyMessage =
			!isTimeRemoveCheck || this.expiresRemoveVerify === null
		// Candidate
		let candidate: IUser | null | undefined

		if (dto.email) {
			candidate = await this.model.getUserByEmail(dto.email)
		} else if (dto.phone) {
			candidate = await this.model.getUserByPhone(dto.phone)
		}

		// Message
		const errorEmailMessage = `A user with email ${dto.email} already exists.`
		const errorPhoneMessage = `A user with phone ${dto.phone} already exists.`

		if (candidate?.id) {
			if (candidate.is_verify)
				return {
					message: errorEmailMessage,
					status: 400,
				}

			if (
				now.getHours() > candidate.created_at.getHours() &&
				!candidate.is_verify
			) {
				await this.userModel.removeUserModel(candidate.id)

				this.expiresVerify = null
				this.expiresRemoveVerify = null

				return {
					message: this.errorAgainExpireMessage,
					status: 400,
				}
			}

			if (
				(isTimeCheck && isTimeRemoveCheck && !candidate.is_verify) ||
				this.expiresRemoveVerify === null
			) {
				await this.userModel.removeUserModel(candidate.id)

				this.expiresVerify = null
				this.expiresRemoveVerify = null

				return {
					message: this.errorAgainExpireMessage,
					status: 400,
				}
			}

			if (
				(isTimeCheck && !candidate.is_verify) ||
				this.expiresVerify === null
			) {
				return {
					message: this.errorExpireMessage,
					status: 400,
				}
			}

			this.logger.info(
				isExpireVerifyMessage
					? this.expireMessage
					: isRemoveExpireVerifyMessage
						? this.errorAgainExpireMessage
						: candidate.email
							? errorEmailMessage
							: errorPhoneMessage
			)

			return {
				message: isExpireVerifyMessage
					? this.expireMessage
					: isRemoveExpireVerifyMessage
						? this.errorAgainExpireMessage
						: candidate.email
							? errorEmailMessage
							: errorPhoneMessage,
				status: isExpireVerifyMessage ? 409 : 400,
			}
		}

		const hasPass = await bcrypt.hash(String(dto.password), 10)
		const { activationLink, resetPassLink } = genLinks(uuidV4)

		const newDto = { ...dto, password: hasPass }

		const newUser = await this.model.createUserModel(
			newDto,
			activationLink,
			resetPassLink
		)

		if (!newUser?.id) return { message: 'Error is not created', status: 500 }

		if (!APP_CONFIG.API_URL)
			return {
				message: 'App config is not set api-url',
				status: 500,
			}

		const link = activationLinkHandler(
			APP_CONFIG.API_URL,
			newUser.activation_link
		)
		const renderHtml = renderSendActivationLink(link, 'активировать аккаунт')

		const resultEmail = await authEmailService.send(
			dto.email,
			'Verify account',
			renderHtml
		)

		if (typeof resultEmail === 'undefined' || typeof resultEmail === 'string')
			return {
				message: 'Error sending email, please repaid sending!',
				status: 500,
			}

		this.expiresVerify = setMinuteUtil(Number(this.expireVerifyUserConfig))
		this.expiresRemoveVerify = setHoursUtil(Number(this.expireVerifyUserRemove))

		if (!newUser.is_verify)
			return {
				message: 'You has been add, please verify your account',
				status: 201,
			}

		return {
			message: 'User has success registration',
			status: 201,
		}
	}

	async verifyAccount(
		activationLink: string | null
	): TypeAuthServiceMessageWithApiError {
		const now = new Date()
		const isTimeCheck =
			this.expiresVerify !== null &&
			now.getTime() >= this.expiresVerify.getTime()
		const isTimeRemoveCheck =
			this.expiresRemoveVerify !== null &&
			now.getTime() >= this.expiresRemoveVerify.getTime()

		if (!activationLink || activationLink === null)
			return ApiError.NotFound('Activation link is must be empty')

		const isVerifyUser = await this.model.verifyModel(activationLink)

		if (
			(isVerifyUser && !isVerifyUser.is_verify) ||
			typeof isVerifyUser === 'boolean'
		)
			return ApiError.BadRequest('Bad-request invalid link')

		if (
			isTimeRemoveCheck &&
			isVerifyUser &&
			!isVerifyUser.is_verify &&
			now.getHours() >= isVerifyUser.created_at.getHours()
		) {
			await this.userModel.removeUserModel(isVerifyUser.id)

			this.expiresRemoveVerify = null
			this.expiresVerify = null

			return ApiError.BadRequest(this.errorAgainExpireMessage)
		}

		if (isTimeCheck && isVerifyUser && isVerifyUser.id)
			return ApiError.BadRequest(this.errorExpireMessage)

		this.expiresVerify = null
		this.expiresRemoveVerify = null

		return {
			message: isVerifyUser.is_verify
				? `The user has success verify account`
				: 'The user has not confirmed the account',
			status: 201,
		}
	}

	async refresh(token: string): Promise<Partial<IAuthUserService>> {
		return this.tokenService.refreshToken(token)
	}

	async logout(refreshToken: string): TypeAuthServiceMessageWithApiError {
		const isVerifyToken = this.tokenService.validateRefreshToken(refreshToken)

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

		const resultRemoveToken = await this.tokenService.removeToken(
			isVerifyToken.sub,
			refreshToken
		)

		if (!resultRemoveToken)
			return ApiError.BadRequest('Something was wrong to logout')

		return {
			message: `Logout has success completed to USER-ID: ${resultRemoveToken.id}`,
			status: 201,
		}
	}

	// Forget
	async forgetPasswordVerify(
		resetLink: string
	): TypeAuthServiceMessageWithApiError {
		const now = new Date()

		const { resetPassLink } = genLinks(uuidV4)
		const dto = (value: boolean) => ({ resetLink, isEnableResetPass: value })

		const isVerifyForgetUser = await this.model.forgetVerifyModel(dto(true))

		if (
			(isVerifyForgetUser && !isVerifyForgetUser.enable_reset_pass) ||
			typeof isVerifyForgetUser === 'boolean'
		)
			return ApiError.BadRequest('Bad-request invalid link')

		const expiresForgetVerify = await this.model.getExpireForget(
			isVerifyForgetUser.id
		)

		if (!expiresForgetVerify)
			return {
				message: 'expire forget verify not founded',
				status: 504,
			}

		const isTimeCheck =
			expiresForgetVerify.expires_forget_pass_at !== null &&
			now.getTime() >= expiresForgetVerify.expires_forget_pass_at.getTime()

		if (isTimeCheck || expiresForgetVerify.expires_forget_pass_at === null) {
			const resetForgetVerify = await this.model.resetForgetVerifyMode(
				resetPassLink,
				isVerifyForgetUser.id,
				false,
				null
			)

			if (!resetForgetVerify)
				return {
					message: 'Something was wrong with reset forget verify',
					status: 500,
				}

			this.isFirstVerifyForgetPassword = true

			return ApiError.BadRequest('The verify for forget password expired!')
		}

		if (
			!this.isFirstVerifyForgetPassword &&
			isVerifyForgetUser.enable_reset_pass
		)
			return ApiError.BadRequest(
				'You already success verify for reset password.',
				409
			)

		this.isFirstVerifyForgetPassword = false

		return {
			message: isVerifyForgetUser.enable_reset_pass
				? 'You have success verify for reset password. Please set new password you have 30m'
				: 'You have is not success verify for reset password.',
			status: isVerifyForgetUser.enable_reset_pass ? 201 : 400,
		}
	}

	async setNewPassword(
		dto: Pick<ForgetDto, 'email' | 'newPassword'>
	): TypeAuthServiceMessageWithApiError {
		const now = new Date()
		const { resetPassLink } = genLinks(uuidV4)
		const user = await this.model.getUserByEmail(dto.email)

		if (!user || !user.id) return ApiError.NotFound('User not founded')

		const expiresForgetVerify = await this.model.getExpireForget(user.id)

		if (!expiresForgetVerify)
			return ApiError.InternalServer('Expire forget not founded!')

		if (
			!user.enable_reset_pass ||
			expiresForgetVerify.expires_forget_pass_at === null
		)
			return ApiError.BadRequest('User is not verify enable-reset password')

		const isTimeCheck =
			expiresForgetVerify.expires_forget_pass_at !== null &&
			now.getTime() >= expiresForgetVerify.expires_forget_pass_at.getTime()

		if (isTimeCheck) {
			const dtoReset = {
				isEnableResetPass: false,
				newPassword: user.password,
			}
			const initUserState = await this.model.resetUpdateUserPassword(
				user.id,
				resetPassLink,
				dtoReset,
				null
			)

			if (!initUserState)
				return ApiError.InternalServer('Error from reset user password')

			return ApiError.BadRequest('The verify for forget password expired!')
		}

		if (typeof dto.newPassword !== 'string')
			return {
				message: 'New password must be string',
				status: 400,
			}

		const hashPass = await bcrypt.hash(dto.newPassword, 10)

		const dtoReset = {
			isEnableResetPass: false,
			newPassword: hashPass,
		}
		const newUserState = await this.model.resetUpdateUserPassword(
			user.id,
			resetPassLink,
			dtoReset,
			null
		)

		if (!newUserState?.id)
			return ApiError.InternalServer('Error from set new password')

		return {
			message: `User have success updated password`,
			status: 201,
		}
	}
}
