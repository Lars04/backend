import type { Logger } from 'winston'
import { BaseConfig } from '../common/abstract/base-config.common'
import { DB_TABLE_LICENSE } from '../common/constants/db.constants'
import type {
	IAppMessage,
	IGetAllDataWithMeta,
} from '../common/types/app.types'
import { ApiError } from '../common/utils/log/exists-error.log'
import {
	CreateLicenseDto,
	LicenseDto,
	type EditLicenseDto,
} from './dto/license.dto'
import type { LicenseModel } from './license.model'
import type { ILicenseDto } from './types/dto.types'

export class LicenseService extends BaseConfig {
	constructor(private model: LicenseModel, private logger: Logger) {
		super()
	}

	async addLicense(dto: CreateLicenseDto): Promise<IAppMessage | ApiError> {
		if (!dto.expiresLicenseAt || !dto.license || !dto.userId)
			return ApiError.BadRequest(
				'Invalid-body create license dto is not defend!'
			)

		const newLicense = await this.model.createLicense(dto)

		if (!newLicense) return ApiError.InternalServer('License is not created!')

		return { message: `License have success created: ID-${newLicense.id}` }
	}

	async findAllLicense(
		userId: string | undefined,
		role: number | undefined,
		limit: number,
		offset: number
	): Promise<IGetAllDataWithMeta<ILicenseDto> | ApiError> {
		if (!userId || typeof userId !== 'string' || typeof role === 'undefined')
			return ApiError.NotFound('User-data is not founded')

		const isAdmin = this.isAdminHandler(role)
		const total = await this.getModelCount(
			DB_TABLE_LICENSE,
			this.logger,
			!isAdmin ? 'user_id' : undefined,
			!isAdmin ? userId : undefined
		)
		const allLicense = await this.model.getAllLicense(
			isAdmin,
			userId,
			limit,
			offset
		)

		if (!allLicense?.length || !total)
			return ApiError.NotFound('License not founded!')

		const allLicenseDto = allLicense.map(item => new LicenseDto(item).toPlain())

		return {
			data: allLicenseDto,
			meta: {
				total,
				limit,
				offset,
			},
		}
	}

	async getUserLicenseStatus(
		userId: string | undefined
	): Promise<{ expiresAt: Date; isActive: boolean } | ApiError> {
		if (!userId || typeof userId !== 'string')
			return ApiError.NotFound('User-data is not founded')

		// Get only the most recent license for this user
		const latestLicense = await this.model.getAllLicense(
			false, // isAdmin = false
			userId,
			1,     // limit = 1
			0      // offset = 0
		)

		if (!latestLicense?.length)
			return ApiError.NotFound('No license found for user')

		const license = latestLicense[0]!
		const expiresAt = license.expires_license_at
		const isActive = expiresAt.getTime() > Date.now()

		return { expiresAt, isActive }
	}

	async findOneLicense(
		licenseId: string | string[] | undefined,
		userId: string | undefined,
		role: number | undefined
	): Promise<LicenseDto | ApiError> {
		if (!licenseId || typeof licenseId !== 'string')
			return ApiError.NotFound('License-ID not founded!')

		if (!userId || typeof userId !== 'string' || typeof role === 'undefined')
			return ApiError.NotFound('User-data is not founded')

		const isAdmin = this.isAdminHandler(role)
		const license = await this.model.getLicenseById(licenseId, userId, isAdmin)

		if (!license) return ApiError.NotFound('License not founded!')

		const licenseDto = new LicenseDto(license)

		return licenseDto
	}

	async updateLicense(
		licenseId: string | string[] | undefined,
		dto: EditLicenseDto
	): Promise<IAppMessage | ApiError> {
		if (!licenseId || typeof licenseId !== 'string')
			return ApiError.NotFound('License not founded!')

		const license = await this.model.editLicense(licenseId, dto)

		if (!license)
			return ApiError.InternalServer('License is not success update!')

		return { message: `License have success update: ID-${license.id}` }
	}

	async deleteLicense(
		licenseId: string | string[] | undefined
	): Promise<IAppMessage | ApiError> {
		if (!licenseId || typeof licenseId !== 'string')
			return ApiError.NotFound('License not founded!')

		const deleteLicense = await this.model.removeLicense(licenseId)

		if (!deleteLicense)
			return ApiError.InternalServer('License is not success delete')

		return {
			message: `License have success delete: ID-${deleteLicense.id}`,
		}
	}
}
