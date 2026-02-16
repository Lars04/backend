import type { Request, Response } from 'express'
import type { Logger } from 'winston'
import { responseInternalServer } from '../common/utils/app/errorResponse.utils'
import type { AdminService } from './admin.service'

export class AdminController {
	constructor(private service: AdminService, private logger: Logger) {}

	async getAllUsers(req: Request, res: Response): Promise<void> {
		try {
			const page = Number(req.query.page) || 1
			const limit = Number(req.query.limit) || 10
			const offset = (page - 1) * limit
			const userServiceResult = await this.service.findAllUser(limit, offset)

			if ('message' in userServiceResult) {
				res
					.status(userServiceResult.status)
					.json({ message: userServiceResult.message })

				return
			}

			res.status(200).json(userServiceResult)
		} catch (error) {
			await responseInternalServer(
				error,
				res,
				'Internal-server from get all admin-users controller',
				this.logger
			)
		}
	}

	async getOneUser(req: Request, res: Response): Promise<void> {
		try {
			const { userId } = req.params
			const user = await this.service.findOneUser(userId)

			if ('message' in user) {
				res.status(user.status).json({ message: user.message })

				return
			}

			res.status(200).json(user)
		} catch (error) {
			await responseInternalServer(
				error,
				res,
				'Internal-server from get-one admin-users controller',
				this.logger
			)
		}
	}

	async editUser(req: Request, res: Response): Promise<void> {
		try {
			const { userId } = req.params
			const body = req.body
			const resultUpdateUser = await this.service.updateUser(userId, body)

			if ('status' in resultUpdateUser) {
				res
					.status(resultUpdateUser.status)
					.json({ message: resultUpdateUser.message })

				return
			}

			res.status(201).json({ message: resultUpdateUser.message })
		} catch (error) {
			await responseInternalServer(
				error,
				res,
				'Internal-server edit-user from admin controller',
				this.logger
			)
		}
	}

	async deleteUser(req: Request, res: Response): Promise<void> {
		try {
			const { userId } = req.params
			const resultDeleteUser = await this.service.deleteUser(userId)

			if ('status' in resultDeleteUser) {
				res
					.status(resultDeleteUser.status)
					.json({ message: resultDeleteUser.message })

				return
			}

			res.status(201).json({ message: resultDeleteUser.message })
		} catch (error) {
			await responseInternalServer(
				error,
				res,
				'Internal-server delete-user from admin controller',
				this.logger
			)
		}
	}
}
