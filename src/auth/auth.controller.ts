import type { Request, Response } from 'express'
import type { Logger } from 'winston'
import { BaseConfig } from '../common/abstract/base-config.common'
import { APP_CONFIG } from '../common/config/app.config'
import { responseInternalServer } from '../common/utils/app/errorResponse.utils'
import type { AuthService } from './auth.service'
import type { EmailService } from './mail/email.service'
import type {
	ForgetDto,
	LoginDto,
	RegistrationDto,
	RepaidVerifyDto,
} from './types/dto.types'

export class AuthController extends BaseConfig {
	constructor(
		private service: AuthService,
		private emailService: EmailService,
		private logger: Logger
	) {
		super()
	}

	async login(req: Request, res: Response): Promise<void> {
		try {
			const body = req.body as LoginDto

			if (!body.email || !body.password) {
				this.logger.error(`User is not writing email or password`)
				res.status(400).json({ message: 'All fields are required' })
				return
			}

			const user = await this.service.login(body)

			if (user && user.status && user.status >= 400) {
				res.status(user.status).json({ message: user.message })

				return
			}

			if (!user.expireRefreshTokenAt) {
				res.status(500).json({
					message: 'Error expire-refresh token is not set',
				})

				return
			}

			const userDto = {
				user: { ...user?.user },
				accessToken: user?.accessToken,
			}

			this.logger.info('User success has been login')

			res.setHeader(
				'Set-cookie',
				`refreshToken=${user?.refreshToken
				}; httpOnly; path=/api; Expires=${user.expireRefreshTokenAt?.toUTCString()}; SameSite=Strict`
			)
			res.status(200).json(userDto)
		} catch (error) {
			await responseInternalServer(
				error,
				res,
				'Internal-server from login controller :(',
				this.logger
			)
		}
	}

	async registration(req: Request, res: Response): Promise<void> {
		try {
			const body = req.body as RegistrationDto

			if (!body.email || !body.firstName || !body.password) {
				this.logger.error(`User is not writing email, password or firstName`)
				res.status(400).json({ message: 'All fields are required' })
				return
			}

			const newUser = await this.service.registration(body)

			if (newUser.message || (newUser.status && newUser.status >= 400)) {
				res.status(newUser.status ?? 500).json({ message: newUser.message })
				return
			}

			res.status(newUser.status ?? 200).json({ message: newUser.message })
		} catch (error) {
			await responseInternalServer(
				error,
				res,
				'Internal-server from registration controller :(',
				this.logger
			)
		}
	}

	async verifyAccount(req: Request, res: Response): Promise<void> {
		try {
			const { link } = req.params
			if (!link || typeof link !== 'string') {
				this.logger.error('Not found activate-link')
				res.status(404).json({ message: 'Not found activate-link' })
				return
			}

			const clientUrl = APP_CONFIG.CLIENT_URL
			const verifyUser = await this.service.verifyAccount(link)
			const jsonData = JSON.stringify({ message: verifyUser.message })

			if (
				verifyUser.status === 201 &&
				clientUrl &&
				typeof clientUrl !== 'undefined'
			) {
				res.writeHead(302, {
					location: clientUrl,
				})
				res.end()

				return
			} else {
				res.writeHead(verifyUser.status, this.headData.contentData)
				res.end(jsonData)

				return
			}
		} catch (error) {
			await responseInternalServer(
				error,
				res,
				'Internal-server from verify-account controller :(',
				this.logger
			)
		}
	}

	async refresh(req: Request, res: Response) {
		try {
			if (!req.cookies || !req.cookies.refreshToken) {
				res.status(400).json({ message: 'Bad-request Cookie is not have' })

				return
			}

			const { refreshToken } = req.cookies

			const newRefresh = await this.service.refresh(refreshToken)

			if (
				('message' in newRefresh && newRefresh.message) ||
				(newRefresh.status && newRefresh.status >= 400)
			) {
				res
					.status(newRefresh.status ?? 500)
					.json({ message: newRefresh.message })

				return
			}

			if (!newRefresh.expireRefreshTokenAt) {
				res
					.status(500)
					.json({ message: 'Error expire-refresh token is not set' })

				return
			}

			res.setHeader(
				'Set-cookie',
				`refreshToken=${newRefresh?.refreshToken
				}; httpOnly; path=/api; Expires=${newRefresh.expireRefreshTokenAt.toUTCString()}; SameSite=Strict`
			)
			res.status(200).json({ accessToken: newRefresh.accessToken })
		} catch (error) {
			await responseInternalServer(
				error,
				res,
				'Internal-server from refresh controller',
				this.logger
			)
		}
	}

	async getLink(req: Request, res: Response): Promise<void> {
		try {
			const repaidSendMail =
				await this.emailService.repaidVerifyAccountSendEmail(
					req.body as RepaidVerifyDto
				)

			res
				.status(repaidSendMail.status)
				.json({ message: repaidSendMail.message })
		} catch (error) {
			await responseInternalServer(
				error,
				res,
				'Internal-server from get-link controller',
				this.logger
			)
		}
	}

	async logout(req: Request, res: Response): Promise<void> {
		try {
			if (
				!req.cookies ||
				!req.cookies.refreshToken ||
				req.cookies.refreshToken === 'refreshToken='
			) {
				const error = JSON.stringify({
					message: 'Bad-request Cookie is not have',
				})

				res.writeHead(400, this.headData.contentData)
				res.end(error)

				return
			}

			const { refreshToken } = req.cookies

			const resultLogoutService = await this.service.logout(refreshToken)

			res.setHeader(
				'Set-cookie',
				`refreshToken=; httpOnly; path=/api; Expires=${this.expiresRemoveRefresh}; SameSite=Strict`
			)
			res
				.status(resultLogoutService.status)
				.json({ message: resultLogoutService.message })
		} catch (error) {
			await responseInternalServer(
				error,
				res,
				'Internal-server from logout controller',
				this.logger
			)
		}
	}

	// Forget pass
	async getForgetLink(req: Request, res: Response): Promise<void> {
		try {
			const body = req.body as RepaidVerifyDto

			if (!body.email) {
				res.status(400).json({ message: 'Invalid-body email is not defend!' })

				return
			}

			const resetSendMail = await this.emailService.forgetPasswordSendLink(body)

			res.status(resetSendMail.status).json({ message: resetSendMail.message })
		} catch (error) {
			await responseInternalServer(
				error,
				res,
				'Internal-server from get reset-link controller',
				this.logger
			)
		}
	}

	async verifyForgetPassword(req: Request, res: Response) {
		try {
			const { link } = req.params
			if (!link || typeof link !== 'string') {
				res.status(404).json({ message: 'Not founded link!' })

				return
			}

			const clientProfileUrl = process.env.CLIENT_PROFILE_URL
			const verifyForgetUser = await this.service.forgetPasswordVerify(link)

			if (
				verifyForgetUser.status === 201 &&
				clientProfileUrl &&
				typeof clientProfileUrl !== 'undefined'
			) {
				res.writeHead(302, {
					location: clientProfileUrl,
				})
				res.end()

				return
			} else {
				res
					.status(verifyForgetUser.status)
					.json({ message: verifyForgetUser.message })

				return
			}
		} catch (error) {
			await responseInternalServer(
				error,
				res,
				'Internal-server from verify-forget controller',
				this.logger
			)
		}
	}

	async newPassword(req: Request, res: Response) {
		try {
			const body = req.body as Pick<ForgetDto, 'email' | 'newPassword'>
			if (!body.email || !body.newPassword) {
				res.status(400).json({
					message: 'Invalid-body email or newPassword is not defend!',
				})

				return
			}

			const newUserData = await this.service.setNewPassword(body)

			res.status(newUserData.status).json({ message: newUserData.message })
		} catch (error) {
			await responseInternalServer(
				error,
				res,
				'Internal-server from new-password controller',
				this.logger
			)
		}
	}
}
