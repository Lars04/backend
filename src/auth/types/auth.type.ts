import type { IAppService } from '../../common/types/app.types'
import type { UserDto } from '../dto/user.dto'

export interface IAuthUserService extends IAppService {
	accessToken: string | { message: string }
	refreshToken: string | { message: string }
	user: UserDto
	expireRefreshTokenAt?: Date
}

export type TypeAuthUserService = Promise<Partial<IAuthUserService>>

export type TypeAuthServiceMessageWithApiError = Promise<
	IAppService & {
		isTimeCheck?: boolean
		code?: number
	}
>
