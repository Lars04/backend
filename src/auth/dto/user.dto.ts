import type { IUser } from '../../app/db/types/user.types'
import type { ROLES } from '../../app/enums'
import type { IAppSharedDto } from '../../common/types/app.types'

export interface IUserDto extends IAppSharedDto {
	firstName: string
	lastName: string | null
	email: string
	phone: string
	role: typeof ROLES | number
	isVerify: boolean
	isActiveLicense: boolean
	enableResetPass: boolean
}

// export interface IAdminUserDto
// 	extends Omit<IUserDto, 'enableResetPass' | 'enableTwoFactoryChallenge'> {
// 	method: typeof AUTH_METHOD
// }

export class UserDto {
	id: string
	firstName: string
	lastName: string | null
	email: string
	phone: string
	role: number
	isVerify: boolean
	enableResetPass: boolean
	isActiveLicense: boolean
	createdAt: Date
	updatedAt: Date

	constructor(data: IUser) {
		this.id = data.id
		this.firstName = data.first_name
		this.lastName = data.last_name
		this.email = data.email
		this.phone = data.phone
		this.role = data.role
		this.isActiveLicense = data.is_active_license
		this.isVerify = data.is_verify
		this.enableResetPass = data.enable_reset_pass
		this.createdAt = data.created_at
		this.updatedAt = data.updated_at
	}

	toPlain(): IUserDto {
		return {
			id: this.id,
			firstName: this.firstName,
			lastName: this.lastName,
			email: this.email,
			phone: this.phone,
			role: this.role,
			isVerify: this.isVerify,
			enableResetPass: this.enableResetPass,
			isActiveLicense: this.isActiveLicense,
			createdAt: this.createdAt,
			updatedAt: this.updatedAt,
		}
	}
}

// export class AdminUsersDto {
// 	id: string
// 	firstName: string | undefined
// 	lastName: string | null | undefined
// 	email: string | undefined
// 	phone: string | undefined
// 	picture: string | null | undefined
// 	role: typeof ROLES | undefined
// 	isVerify: boolean | undefined
// 	method: typeof AUTH_METHOD | undefined
// 	createdAt: Date
// 	updatedAt: Date

// 	constructor(data: TypeUserClientRes) {
// 		this.id = data.id
// 		this.firstName = data.first_name
// 		this.lastName = data.last_name
// 		this.email = data.email
// 		this.phone = data.phone
// 		this.picture = data.picture
// 		this.role = data.role
// 		this.isVerify = data.is_verify
// 		this.method = data.method
// 		this.createdAt = data.created_at
// 		this.updatedAt = data.updated_at
// 	}

// 	toPlain(): Partial<IAdminUserDto> {
// 		return {
// 			id: this.id,
// 			firstName: this.firstName,
// 			lastName: this.lastName,
// 			email: this.email,
// 			phone: this.phone,
// 			picture: this.picture,
// 			isVerify: this.isVerify,
// 			method: this.method,
// 			role: this.role,
// 			createdAt: this.createdAt,
// 			updatedAt: this.updatedAt,
// 		}
// 	}
// }
