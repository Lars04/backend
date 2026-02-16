import type { ILicense } from '../../app/db/types/license.types'
import { encrypt } from '../../common/utils/app/crypto.util'
import type { ILicenseDto } from '../types/dto.types'

export class CreateLicenseDto {
	userId: string | undefined
	license: string | undefined
	expiresLicenseAt: Date | undefined
}

export type EditLicenseDto = Omit<CreateLicenseDto, 'userId'>

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
		const encryptedExpire = encrypt(this.expiresLicenseAt.toISOString())

		return {
			id: this.id,
			userId: this.userId,
			license: this.license,
			expiresLicenseAt: encryptedExpire.encrypted,
			expiresLicenseIv: encryptedExpire.iv,
			expiresLicenseTag: encryptedExpire.tag,
			createdAt: this.createdAt,
			updatedAt: this.updatedAt,
		}
	}
}
