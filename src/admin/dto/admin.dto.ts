import { EditProfileDto } from '../../profile/types/dto.types'
import type { TypeAdminUserDto } from '../types/dto.types'
import type { TypeUserClientRes } from '../types/model.types'

export class AdminUserEditDto extends EditProfileDto {
	email: string | undefined
	role: number | undefined
	isVerify: boolean | undefined
	isActiveLicense: boolean | undefined
	password: string | undefined
}

export class AdminUsersDto {
	id: string
	firstName: string
	lastName: string | null
	email: string
	phone: string
	role: number
	isVerify: boolean
	isActiveLicense: boolean
	expiresLicenseAt: Date | null
	licenseType: string | null
	createdAt: Date
	updatedAt: Date

	constructor(data: TypeUserClientRes) {
		this.id = data.id
		this.firstName = data.first_name
		this.lastName = data.last_name
		this.email = data.email
		this.phone = data.phone
		this.isActiveLicense = data.is_active_license
		this.expiresLicenseAt = data.expires_license_at ?? null
		this.licenseType = data.license_type ?? null
		this.role = data.role
		this.isVerify = data.is_verify
		this.createdAt = data.created_at
		this.updatedAt = data.updated_at
	}

	toPlain(): Partial<TypeAdminUserDto> {
		return {
			id: this.id,
			firstName: this.firstName,
			lastName: this.lastName,
			email: this.email,
			phone: this.phone,
			isVerify: this.isVerify,
			isActiveLicense: this.isActiveLicense,
			expiresLicenseAt: this.expiresLicenseAt,
			licenseType: this.licenseType,
			role: this.role,
			createdAt: this.createdAt,
			updatedAt: this.updatedAt,
		}
	}
}
