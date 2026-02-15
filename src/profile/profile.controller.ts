import type { Response } from 'express'
import type { Logger } from 'winston'
import type { IRequestUserApp } from '../auth/types/token.type'
import { BaseConfig } from '../common/abstract/base-config.common'
import {
	responseBadRequest,
	responseInternalServer,
} from '../common/utils/app/errorResponse.utils'
import type { ProfileService } from './profile.service'

export class ProfileController extends BaseConfig {
	constructor(private service: ProfileService, private logger: Logger) {
		super()
	}

	async findProfileMe(req: IRequestUserApp, res: Response): Promise<void> {
		try {
			const userId = req.user?.sub
			const userProfile = await this.service.findOneProfile(userId)

			if (
				'message' in userProfile &&
				userProfile.message &&
				userProfile.status
			) {
				res.status(userProfile.status).json({ message: userProfile.message })

				return
			}

			res.status(200).json(userProfile)
		} catch (error) {
			await responseInternalServer(
				error,
				res,
				'Internal-server from get profile-me!',
				this.logger
			)
		}
	}

	async editProfileMe(req: IRequestUserApp, res: Response): Promise<void> {
		try {
			const userId = req.user?.sub
			const updateUserProfile = await this.service.editProfile(userId, req.body)
			if ('status' in updateUserProfile) {
				await responseBadRequest(
					updateUserProfile.message,
					res,
					updateUserProfile.status
				)

				return
			}

			res.status(201).json(updateUserProfile)
		} catch (error) {
			await responseInternalServer(
				error,
				res,
				'Internal-server from update/edit profile!',
				this.logger
			)
		}
	}
}
