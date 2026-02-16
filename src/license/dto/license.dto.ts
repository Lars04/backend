import type { ILicense } from '../../app/db/types/license.types'
import type { ILicenseDto } from '../types/dto.types'

export class CreateAndEditLicenseDto {
	userId: string | undefined
	license: string | undefined
	expiresLicenseAt: Date | undefined
}

export class LicenseDto {
	id: string
	userId: string
	license: string
	expiresLicenseAt: Date
	createdAt: Date
	updatedAt: Date

	constructor(data: ILicense) {
		this.id = data.id
		this.userId = data.user_id
		this.license = data.license
		this.expiresLicenseAt = data.expires_license_at
		this.createdAt = data.created_at
		this.updatedAt = data.updated_at
	}

	toPlain(): ILicenseDto {
		return {
			id: this.id,
			userId: this.userId,
			license: this.license,
			expiresLicenseAt: this.expiresLicenseAt,
			createdAt: this.createdAt,
			updatedAt: this.updatedAt,
		}
	}
}
