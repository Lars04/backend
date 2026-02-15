import type { Logger } from 'winston'
import { UserDto } from '../auth/dto/user.dto'
import { BaseConfig } from '../common/abstract/base-config.common'
import type { IAppMessage } from '../common/types/app.types'
import { ApiError } from '../common/utils/log/exists-error.log'
import type { ProfileModel } from './profile.model'
import type { EditProfileDto } from './types/dto.types'
import type { IProfile } from './types/service.profile'

export class ProfileService extends BaseConfig {
	constructor(private model: ProfileModel, private logger: Logger) {
		super()
	}

	async findOneProfile(
		userId: string | undefined
	): Promise<IProfile | ApiError> {
		if (!userId) return ApiError.NotFound('User ID not founded!')
		const userProfile = await this.model.getProfileMe(userId)

		if (!userProfile)
			return ApiError.NotFound('User not founded from Database!')

		const userProfileDto = new UserDto(userProfile)

		return {
			profile: userProfileDto,
		}
	}

	async editProfile(
		userId: string | undefined,
		dto: EditProfileDto
	): Promise<IAppMessage | ApiError> {
		if (!userId) return ApiError.NotFound('User ID not founded!')

		const updateUserProfile = await this.model.updateProfile(userId, dto)

		if (!updateUserProfile)
			return ApiError.InternalServer('User profile is not success update!')

		return {
			message: 'Profile data success update!',
		}
	}
}
