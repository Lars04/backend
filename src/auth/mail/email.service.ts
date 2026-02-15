import { createTransport, type Transporter } from 'nodemailer'
import type { Logger } from 'winston'
import { BaseConfig } from '../../common/abstract/base-config.common'
import { APP_CONFIG, APP_EMAIL_CONFIG } from '../../common/config/app.config'
import {
	activationLinkHandler,
	resetPassLinkHandler,
} from '../../common/constants/link.constant'
import { setMinuteUtil } from '../../common/utils/app/date.util'
import { renderSendActivationLink } from '../../common/utils/format/render.util'
import { ApiError } from '../../common/utils/log/exists-error.log'
import type { AuthModel } from '../auth.model'
import type { TypeAuthServiceMessageWithApiError } from '../types/auth.type'
import type { RepaidVerifyDto } from '../types/dto.types'
import type { IResponseEmail } from '../types/mail.types'

export class EmailService extends BaseConfig {
	private transporter: Transporter

	constructor(protected logger: Logger, protected authModel: AuthModel) {
		super()
		this.transporter = createTransport({
			host: APP_EMAIL_CONFIG.SMTP_HOST,
			port: APP_EMAIL_CONFIG.SMTP_PORT || 587,
			tls: {
				rejectUnauthorized: true,
			},
			secure: false,
			auth: {
				user: APP_EMAIL_CONFIG.SMTP_USER,
				pass: APP_EMAIL_CONFIG.SMTP_PASSWORD,
			},
		})
	}

	async send(
		to: string | undefined,
		subject: string,
		html: string
	): Promise<IResponseEmail | string | undefined> {
		try {
			const mailResult = await this.transporter.sendMail({
				from: APP_EMAIL_CONFIG.SMTP_USER,
				to,
				subject: subject,
				text: '',
				html,
			})

			return mailResult
		} catch (error) {
			let errorMessage: undefined | string
			if (error instanceof Error) {
				errorMessage = `Ошибка при отправке письма: ${error.message}`
				this.logger.error(errorMessage)
			} else {
				errorMessage = `Ошибка при отправке письма`
				this.logger.error(errorMessage)
			}

			return errorMessage
		}
	}

	// !Verify
	async repaidVerifyAccountSendEmail(
		dto: RepaidVerifyDto
	): TypeAuthServiceMessageWithApiError {
		if (!APP_CONFIG.API_URL)
			return {
				message: 'App config is not set api-url',
				status: 500,
			}

		const now = new Date()
		const errorEmailMessage = `A user with email ${dto.email} already exists.`
		const repaidExpireMessage = `Please confirm your account verify the link, you have ${this.expireVerifyUserConfig}${this.expireVerifyUserUnityCaseConfig} to do this.`

		const isTimeCheck =
			this.expiresVerify !== null &&
			now.getTime() >= this.expiresVerify.getTime()

		if (
			!isTimeCheck &&
			!this.isFirstSendEmailVerifyAccount &&
			this.expiresVerify !== null
		) {
			return ApiError.BadRequest('Expire time verify is not completed')
		}

		if (
			isTimeCheck &&
			!this.isFirstSendEmailVerifyAccount &&
			this.expiresVerify !== null
		) {
			this.expiresVerify = null

			this.isFirstSendEmailVerifyAccount = true

			return ApiError.BadRequest('Expire verify time that all')
		}

		const user = await this.authModel.getUserByEmail(dto.email)

		if (!user) return ApiError.NotFound('User is not founded!')

		if (user.is_verify)
			return ApiError.BadRequest('User have been success verify')

		const link = activationLinkHandler(APP_CONFIG.API_URL, user.activation_link)
		const renderHtml = renderSendActivationLink(link, 'активировать аккаунт')
		const resultEmail = await this.send(dto.email, 'Verify account', renderHtml)

		if (typeof resultEmail === 'undefined' || typeof resultEmail === 'string')
			return ApiError.BadRequest('Error sending email')

		if (this.expiresVerify === null) {
			this.expiresVerify = setMinuteUtil(Number(this.expireVerifyUserConfig))
		}

		this.isFirstSendEmailVerifyAccount = false

		return {
			message: !isTimeCheck ? repaidExpireMessage : errorEmailMessage,
			status: !isTimeCheck ? 409 : 400,
		}
	}

	// !Reset-password
	async forgetPasswordSendLink(
		dto: RepaidVerifyDto
	): TypeAuthServiceMessageWithApiError {
		if (!APP_CONFIG.API_URL)
			return {
				message: 'App config is not set api-url',
				status: 500,
			}

		const now = new Date()
		const resetPassExpireMessage = `Please confirm your reset-password verify the link, you have 2 minutes to do this.`

		const user = await this.authModel.getUserByEmail(dto.email)

		if (!user || !user.id) return ApiError.NotFound('User is not founded!')

		const expireUserForgetVerify = await this.authModel.getExpireForget(user.id)

		if (!expireUserForgetVerify)
			return {
				message: 'Expire forget verify not founded',
				status: 500,
			}

		const isTimeCheck =
			expireUserForgetVerify.expires_forget_pass_at !== null &&
			now.getTime() >= expireUserForgetVerify.expires_forget_pass_at.getTime()

		if (
			!isTimeCheck &&
			!this.isFirstSendEmailForgetPassword &&
			expireUserForgetVerify.expires_forget_pass_at !== null
		)
			return ApiError.BadRequest('The password reset has not expired.', 409)

		if (isTimeCheck && expireUserForgetVerify.expires_forget_pass_at !== null) {
			const updateExpireForget = await this.authModel.updateExpireForgetVerify(
				user.id,
				null
			)

			if (!updateExpireForget)
				return {
					message: 'Something was wrong with update expire forget',
					status: 500,
				}

			this.isFirstSendEmailForgetPassword = true

			return ApiError.BadRequest('Expire reset verify time that all')
		}

		const resetLink = resetPassLinkHandler(
			APP_CONFIG.API_URL,
			user.reset_pass_link
		)
		const renderHtml = renderSendActivationLink(resetLink, 'сброс пароль')
		const resultEmail = await this.send(dto.email, 'Reset-password', renderHtml)

		if (typeof resultEmail === 'undefined' || typeof resultEmail === 'string')
			return ApiError.BadRequest('Error sending email')

		if (expireUserForgetVerify.expires_forget_pass_at === null) {
			const newExpireForgetVerify = setMinuteUtil(
				Number(this.expireVerifyUserResetPassword)
			)

			const updateExpireForget = await this.authModel.updateExpireForgetVerify(
				user.id,
				newExpireForgetVerify
			)

			if (!updateExpireForget)
				return {
					message: 'Something was wrong with update expire forget',
					status: 500,
				}
		}

		this.isFirstSendEmailForgetPassword = false

		return {
			message: resetPassExpireMessage,
			status: 200,
		}
	}
}
