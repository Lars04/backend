import type { Logger } from 'winston'

import type { IUserDto } from '../auth/dto/user.dto'
import { BaseConfig } from '../common/abstract/base-config.common'
import { DB_TABLE_USERS } from '../common/constants/db.constants'
import type {
	IAppMessage,
	IGetAllDataWithMeta,
} from '../common/types/app.types'
import { ApiError } from '../common/utils/log/exists-error.log'
import type { AdminModel } from './admin.model'
import { AdminUserEditDto, AdminUsersDto } from './dto/admin.dto'

export class AdminService extends BaseConfig {
	constructor(private model: AdminModel, private logger: Logger) {
		super()
	}

	async findAllUser(
		limit: number = 10,
		offset: number = 0
	): Promise<IGetAllDataWithMeta<Partial<IUserDto>> | ApiError> {
		const allUser = await this.model.getAllUserModel(limit, offset)
		const total = await this.getModelCount(DB_TABLE_USERS, this.logger)

		if (!allUser.length || !total)
			return ApiError.NotFound('Users not founded!')

		const usersDto = allUser.map(item => new AdminUsersDto(item).toPlain())

		return {
			data: usersDto,
			meta: {
				total,
				limit,
				offset,
			},
		}
	}

	async findOneUser(
		userId: string | string[] | undefined
	): Promise<AdminUsersDto | ApiError> {
		if (!userId || typeof userId !== 'string')
			return ApiError.NotFound('User-id not founded!')

		const getUser = await this.model.getUserByIdModel(userId)

		if (!getUser) return ApiError.NotFound('User not founded from db!')

		const userDto = new AdminUsersDto(getUser)

		return userDto
	}

	async updateUser(
		userId: string | string[] | undefined,
		dto: AdminUserEditDto
	): Promise<IAppMessage | ApiError> {
		if (!userId || typeof userId !== 'string')
			return ApiError.NotFound('Error user not founded!')

		const getUser = await this.model.getUserByIdModel(userId)

		if (!getUser) return ApiError.NotFound('User not founded from db!')

		const updateUser = await this.model.editUserModel(getUser.id, dto)

		if (!updateUser) return ApiError.BadRequest('Error from update user!')

		return {
			message: 'User has success updated!',
		}
	}

	async deleteUser(
		userId: string | string[] | undefined
	): Promise<IAppMessage | ApiError> {
		if (!userId || typeof userId !== 'string')
			return ApiError.NotFound('User-id not founded!')

		const getUser = await this.model.getUserByIdModel(userId)

		if (!getUser) return ApiError.NotFound('User not founded from db!')

		const removeUser = await this.model.removeUserModel(getUser.id)

		if (!removeUser) return ApiError.BadRequest('Error from update user!')

		return {
			message: 'User has success delete!',
		}
	}
}
